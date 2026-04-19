import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getFirestore,
    doc,
    getDoc,
    getDocs,
    collection, 
    query, 
    where,
    orderBy, 
    limit, 
    addDoc, 
    updateDoc,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Firebase Ayarları
const firebaseConfig = {
    apiKey: "AIzaSyAPa4-8qVuExM5RP32JcnP2cq5L391uwfU",
    authDomain: "yazilim-gelistirme-web-site.firebaseapp.com",
    projectId: "yazilim-gelistirme-web-site",
    storageBucket: "yazilim-gelistirme-web-site.firebasestorage.app",
    messagingSenderId: "373546414576",
    appId: "1:373546414576:web:6c4c92603dd184c8736d35"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let currentUserData = null;

// DOM Elemanları
const welcomeName = document.getElementById('welcomeName');
const userEmail = document.getElementById('userEmail');
const myScore = document.getElementById('myScore');
const leaderboardContainer = document.getElementById('leaderboardContainer');
const questionsContainer = document.getElementById('questionsContainer');
const logoutBtn = document.getElementById('logoutBtn');
const adminLink = document.getElementById('adminLink');
const submitOdevBtn = document.getElementById('submitOdev');

// Oturum Kontrolü
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    // Kullanıcı verilerini çek
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
        currentUserData = userDoc.data();
        welcomeName.innerText = `Hoş geldin, ${currentUserData.adSoyad}`;
        userEmail.innerText = user.email;
        myScore.innerText = `${currentUserData.score || 0} Puan`;

        if (currentUserData.role === 'admin') {
            adminLink.style.display = 'inline-block';
        }
    }

    // Verileri yükle
    loadLeaderboard();
    loadQuestions();
    loadAssignments();
    loadPastSubmissions();
});

// Liderlik Tablosunu Yükle
async function loadLeaderboard() {
    try {
        const q = query(collection(db, "users"), orderBy("score", "desc"), limit(10));
        const querySnapshot = await getDocs(q);

        leaderboardContainer.innerHTML = "";
        let rank = 1;

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const item = document.createElement('li');
            item.className = 'leaderboard-item';
            item.innerHTML = `
                <span class="rank">#${rank}</span>
                <span class="student-name">${data.adSoyad}</span>
                <span class="score">${data.score || 0} Puan</span>
            `;
            leaderboardContainer.appendChild(item);
            rank++;
        });
    } catch (error) {
        console.error("Leaderboard yükleme hatası:", error);
    }
}

// Soruları Yükle
async function loadQuestions() {
    try {
        const q = query(collection(db, "questions"), where("aktif", "==", true));
        const querySnapshot = await getDocs(q);

        questionsContainer.innerHTML = "";
        if (querySnapshot.empty) {
            questionsContainer.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 20px;">Şu an aktif soru bulunmuyor.</p>';
            return;
        }
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const qId = doc.id;

            const qDiv = document.createElement('div');
            qDiv.className = 'question-item';

            let optionsHtml = "";
            data.secenekler.forEach((opt, index) => {
                optionsHtml += `<button class="option-btn" onclick="checkAnswer('${qId}', '${opt}', this)">${opt}</button>`;
            });

            qDiv.innerHTML = `
                <div class="question-text">${data.baslik}: ${data.soru_metni}</div>
                <div class="options-grid">${optionsHtml}</div>
                <div id="feedback-${qId}" style="margin-top: 10px; font-weight: 600; display: none;"></div>
            `;
            questionsContainer.appendChild(qDiv);
        });

        // Global fonksiyon olarak ata (checkAnswer)
        window.checkAnswer = async (qId, selected, btn) => {
            const qDoc = await getDoc(doc(db, "questions", qId));
            const correct = qDoc.data().dogruCevap;
            const feedback = document.getElementById(`feedback-${qId}`);

            // Tüm butonları pasif yap
            const btns = btn.parentElement.querySelectorAll('.option-btn');
            btns.forEach(b => b.disabled = true);

            if (selected === correct) {
                btn.classList.add('correct');
                feedback.innerText = "✅ Tebrikler! Doğru cevap.";
                feedback.style.color = "#22c55e";
            } else {
                btn.classList.add('wrong');
                feedback.innerText = `❌ Yanlış cevap. Doğru: ${correct}`;
                feedback.style.color = "#ef4444";
            }
            feedback.style.display = "block";
        };

    } catch (error) {
        console.error("Sorular yüklenemedi:", error);
    }
}

// Ödevleri Yükle
async function loadAssignments() {
    const assignmentsContainer = document.getElementById('assignmentsContainer');
    const odevSelect = document.getElementById('odevKoduSelect');

    try {
        const q = query(collection(db, "assignments"), where("aktif", "==", true), orderBy("tarih", "desc"));
        const querySnapshot = await getDocs(q);

        assignmentsContainer.innerHTML = "";
        odevSelect.innerHTML = '<option value="">Ödev Seçiniz...</option>';

        if (querySnapshot.empty) {
            assignmentsContainer.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 20px;">Henüz aktif ödev yayınlanmamış.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();

            // Eğitim Sayfasında Listele
            const aDiv = document.createElement('div');
            aDiv.className = 'question-item';
            aDiv.innerHTML = `
                <div class="question-text" style="color: #3b82f6; font-size: 1.1rem;">${data.baslik}</div>
                <div style="color: #e2e8f0; line-height: 1.6; white-space: pre-wrap;">${data.aciklama}</div>
            `;
            assignmentsContainer.appendChild(aDiv);

            // Select Kutusuna Ekle
            const opt = document.createElement('option');
            opt.value = data.baslik;
            opt.innerText = data.baslik;
            odevSelect.appendChild(opt);
        });
    } catch (error) {
        console.error("Ödevler yüklenemedi:", error);
    }
}

// Geçmiş Ödevleri ve Geri Bildirimleri Yükle
async function loadPastSubmissions() {
    const container = document.getElementById('pastSubmissionsContainer');
    const user = auth.currentUser;
    if (!user) return;

    try {
        const q = query(
            collection(db, "submissions"), 
            where("userId", "==", user.uid), 
            where("durum", "in", ["okundu", "itiraz-edildi", "tamamlandi"]),
            orderBy("puanlanmaTarihi", "desc")
        );
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) return;

        container.innerHTML = "";
        querySnapshot.forEach((subDoc) => {
            const data = subDoc.data();
            const id = subDoc.id;
            
            const div = document.createElement('div');
            div.className = 'question-item';
            div.style.marginBottom = "20px";
            div.style.borderLeft = "4px solid #3b82f6";

            let replyHtml = "";
            if (data.durum === "okundu") {
                replyHtml = `
                    <div style="margin-top: 15px; display: flex; gap: 10px;">
                        <textarea id="reply-${id}" placeholder="Admin'e cevap yazın veya itiraz edin..." style="flex: 1; height: 60px; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; outline: none;"></textarea>
                        <div style="display: flex; flex-direction: column; gap: 5px;">
                            <button class="btn-sm-secondary" style="background: #3b82f6; color: #fff; padding: 8px 15px;" onclick="submitReply('${id}')">Gönder</button>
                            <button class="btn-sm-secondary" style="background: rgba(34, 197, 94, 0.2); color: #22c55e; border: 1px solid #22c55e; padding: 8px 15px;" onclick="completeConversation('${id}')">Teşekkür Et & Bitir</button>
                        </div>
                    </div>
                `;
            } else if (data.durum === "itiraz-edildi") {
                replyHtml = `<div style="margin-top: 10px; color: #fbbf24; font-size: 0.85rem; font-style: italic;">Cevabınız iletildi, admin bekleniyor...</div>`;
            } else if (data.durum === "tamamlandi") {
                replyHtml = `<div style="margin-top: 10px; color: #22c55e; font-size: 0.85rem; font-weight: 600;">✅ Konuşma başarıyla tamamlandı.</div>`;
            }

            div.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <strong style="color: #3b82f6;">${data.odevKodu}</strong>
                    <span class="score">${data.puan} Puan</span>
                </div>
                <div style="font-size: 0.9rem; color: #94a3b8; margin-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 5px;">
                    <strong>Senin Kodun:</strong><br>${data.icerik.substring(0, 50)}...
                </div>
                <div style="background: rgba(59, 130, 246, 0.1); padding: 12px; border-radius: 8px;">
                    <strong style="color: #60a5fa;">Admin Notu:</strong><br>
                    ${data.feedback || "Geri bildirim bırakılmadı."}
                </div>
                ${data.studentReply ? `<div style="margin-top: 10px; padding-left: 10px; border-left: 2px solid #64748b; font-size: 0.85rem; color: #94a3b8;"><strong>Senin Cevabın:</strong> ${data.studentReply}</div>` : ""}
                ${replyHtml}
            `;
            container.appendChild(div);
        });

        // Global fonksiyonlar
        window.submitReply = async (subId) => {
            const msg = document.getElementById(`reply-${subId}`).value;
            if (!msg) return;

            try {
                await updateDoc(doc(db, "submissions", subId), {
                    studentReply: msg,
                    durum: "itiraz-edildi",
                    tarihReply: serverTimestamp()
                });

                // EmailJS Bildirimi (Veritabanı işlemini engellememesi için ayrı try-catch)
                try {
                    await emailjs.send("service_1zse5dr", "template_qkbrjzn", {
                        to_email: "daykul75@gmail.com",
                        subject: `YGT: Öğrenciden Yeni Mesaj (${currentUserData.adSoyad})`,
                        message: `${currentUserData.adSoyad} isimli öğrenci ödevi için mesaj gönderdi: ${msg}`,
                        user_name: "YGT Admin",
                        email: "daykul75@gmail.com",
                        link: window.location.origin
                    });
                } catch (emailError) {
                    console.error("EmailJS Bildirim Hatası:", emailError);
                }

                alert("Mesajınız iletildi.");
                loadPastSubmissions();
            } catch (e) { 
                console.error("Veritabanı Güncelleme Hatası:", e);
                alert("Hata: " + e.message); 
            }
        };

        // Konuşmayı Bitir
        window.completeConversation = async (subId) => {
            if (!confirm("Teşekkür edip konuşmayı sonlandırmak istediğinize emin misiniz?")) return;
            try {
                await updateDoc(doc(db, "submissions", subId), {
                    durum: "tamamlandi"
                });
                alert("Konuşma sonlandırıldı. Başarılar!");
                loadPastSubmissions();
            } catch (e) { alert(e.message); }
        };

    } catch (error) {
        console.error("Geçmiş ödevler yüklenemedi:", error);
    }
}

// Ödev Gönderimi
submitOdevBtn.addEventListener('click', async () => {
    const title = document.getElementById('odevKoduSelect').value;
    const content = document.getElementById('submissionContent').value;
    const user = auth.currentUser;

    if (!title) {
        alert("Lütfen ödev seçiniz.");
        return;
    }
    if(!content)
    {
        alert("lütfen cevap kısmını doldurunuz.");
        return;
    }

    submitOdevBtn.disabled = true;
    submitOdevBtn.innerText = "Gönderiliyor...";

    try {
        await addDoc(collection(db, "submissions"), {
            userId: user.uid,
            adSoyad: currentUserData.adSoyad,
            userEmail: user.email, // Email eklendi
            odevKodu: title,
            icerik: content,
            durum: "bekliyor",
            tarih: serverTimestamp()
        });
        // EmailJS Bildirimi (Admin'e yeni ödev geldi bildirimi)
        try {
            await emailjs.send("service_1zse5dr", "template_qkbrjzn", {
                to_email: "daykul75@gmail.com",
                subject: `YGT: Yeni Ödev Teslim Edildi (${currentUserData.adSoyad})`,
                message: `${currentUserData.adSoyad} isimli öğrenci '${title}' başlıklı ödevini teslim etti.`,
                user_name: "YGT Admin",
                email: "daykul75@gmail.com",
                link: window.location.origin
            });
        } catch (emailError) {
            console.error("EmailJS Bildirim Hatası:", emailError);
        }

        alert("Ödeviniz başarıyla gönderildi! Admin onayından sonra puanınız eklenecektir.");
        document.getElementById('odevKoduSelect').value = ""; // ID Düzeltildi
        document.getElementById('submissionContent').value = "";
    } catch (error) {
        console.error("Ödev gönderim hatası:", error);
        alert("Gönderilemedi: " + error.message);
    } finally {
        submitOdevBtn.disabled = false;
        submitOdevBtn.innerText = "Ödevi Gönder";
    }
});

// Çıkış Yap
logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = "login.html";
    });
});
