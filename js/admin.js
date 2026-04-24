import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, 
    doc, 
    getDoc, 
    getDocs, 
    collection, 
    query, 
    where, 
    addDoc, 
    updateDoc, 
    increment, 
    writeBatch,
    serverTimestamp,
    orderBy,
    deleteDoc
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

// Yetki Kontrolü
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists() || userDoc.data().role !== 'admin') {
        alert("Bu sayfaya erişim yetkiniz yok!");
        window.location.href = "egitim.html";
        return;
    }

    // Yetki varsa yükle
    loadSubmissions();
    loadManagementLists();
    loadStudentReplies();
});

// Blog Ekleme Mantığı
const addBlogForm = document.getElementById('addBlogForm');
if (addBlogForm) {
    addBlogForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = document.getElementById('blogSubmitBtn');
        const originalText = submitBtn.innerText;
        
        const baslik = document.getElementById('bBaslik').value;
        const yazar = document.getElementById('bYazar').value;
        const icerik = document.getElementById('bIcerik').value;
        const fotoIsim = document.getElementById('bFotoIsim').value;

        try {
            submitBtn.innerText = "Yayınlanıyor...";
            submitBtn.disabled = true;

            // Firestore'a kaydet (Sadece dosya ismini tutuyoruz)
            await addDoc(collection(db, "bloglar"), {
                baslik,
                yazar,
                fotoUrl: fotoIsim, // Sadece dosya adı
                icerik,
                tarih: serverTimestamp()
            });

            alert("Blog yazısı başarıyla yayınlandı! Lütfen fotoğrafı 'foto' klasörüne eklemeyi unutmayın.");
            addBlogForm.reset();
            loadManagementLists();
        } catch (error) {
            console.error("Hata:", error);
            alert("Blog eklenirken bir hata oluştu: " + error.message);
        } finally {
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Soru Ekleme Mantığı
const addQuestionForm = document.getElementById('addQuestionForm');
addQuestionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const baslik = document.getElementById('qBaslik').value;
    const metin = document.getElementById('qMetin').value;
    const dogru = document.getElementById('qDogru').value;
    const secenekler = Array.from(document.querySelectorAll('.qSecenek')).map(i => i.value);

    try {
        await addDoc(collection(db, "questions"), {
            baslik,
            soru_metni: metin,
            secenekler,
            dogruCevap: dogru,
            aktif: true,
            tarih: new Date().toISOString()
        });

        alert("Soru başarıyla eklendi!");
        addQuestionForm.reset();
        loadManagementLists();
    } catch (error) {
        alert("Hata: " + error.message);
    }
});

// Ödev Yayınlama Mantığı
const addAssignmentForm = document.getElementById('addAssignmentForm');
addAssignmentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const baslik = document.getElementById('aBaslik').value;
    const metin = document.getElementById('aMetin').value;

    try {
        await addDoc(collection(db, "assignments"), {
            baslik,
            aciklama: metin,
            aktif: true,
            tarih: serverTimestamp()
        });

        alert("Ödev başarıyla yayınlandı!");
        addAssignmentForm.reset();
        loadManagementLists();
    } catch (error) {
        alert("Hata: " + error.message);
    }
});

// Bekleyen Ödevleri Yükle
async function loadSubmissions() {
    const listDiv = document.getElementById('submissionsList');
    
    try {
        const q = query(collection(db, "submissions"), where("durum", "==", "bekliyor"));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            listDiv.innerHTML = '<p class="no-data">Şu an bekleyen ödev bulunmuyor. 🎉</p>';
            return;
        }

        listDiv.innerHTML = "";
        querySnapshot.forEach((subDoc) => {
            const data = subDoc.data();
            const id = subDoc.id;
            
            const card = document.createElement('div');
            card.className = 'submission-card';
            card.innerHTML = `
                <div class="sub-header">
                    <div class="sub-user">
                        <h4>${data.adSoyad}</h4>
                        <p>${data.odevKodu}</p>
                    </div>
                    <div class="sub-date">${data.tarih ? data.tarih.toDate().toLocaleString('tr-TR') : 'Bilinmiyor'}</div>
                </div>
                <div class="sub-content">${data.icerik}</div>
                <div class="puanlama-row" style="flex-direction: column; align-items: flex-start; gap: 10px;">
                    <textarea id="feedback-${id}" placeholder="Öğrenciye geri bildirim yazın..." style="width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; outline: none;"></textarea>
                    <div style="display: flex; gap: 15px; width: 100%;">
                        <input type="number" id="puan-${id}" class="puan-input" placeholder="0-100" min="0" max="100">
                        <button class="btn-approve" style="flex: 1;" onclick="approveSubmission('${id}', '${data.userId}')">Puanla ve Geri Bildirim Gönder</button>
                    </div>
                </div>
            `;
            listDiv.appendChild(card);
        });

        // Global fonksiyon olarak ata
        window.approveSubmission = async (subId, studentId) => {
            const puanInput = document.getElementById(`puan-${subId}`);
            const feedbackInput = document.getElementById(`feedback-${subId}`);
            const puan = parseInt(puanInput.value);
            const feedback = feedbackInput.value;

            if (isNaN(puan)) {
                alert("Lütfen geçerli bir puan girin.");
                return;
            }

            try {
                const batch = writeBatch(db);
                
                // 1. Ödevi 'okundu' yap
                const subRef = doc(db, "submissions", subId);
                const subDoc = await getDoc(subRef);
                const data = subDoc.data();

                batch.update(subRef, { 
                    durum: "okundu",
                    feedback: feedback,
                    puan: puan,
                    puanlanmaTarihi: serverTimestamp()
                });

                // 2. Öğrenci skorunu güncelle
                const userRef = doc(db, "users", studentId);
                batch.update(userRef, { score: increment(puan) });

                await batch.commit();

                // EmailJS Bildirimi
                try {
                    await emailjs.send("service_1zse5dr", "template_qkbrjzn", {
                        to_email: data.userEmail || "daykul75@gmail.com",
                        subject: "YGT: Ödevin Puanlandı!",
                        message: `Merhaba ${data.adSoyad}, '${data.odevKodu}' başlıklı ödevin puanlandı. Puanın: ${puan}. Not: ${feedback}`,
                        user_name: data.adSoyad,
                        email: data.userEmail || "daykul75@gmail.com",
                        link: window.location.origin
                    });
                } catch (emailError) {
                    console.error("EmailJS Hatası:", emailError);
                }

                alert("Ödev puanlandı ve geri bildirim gönderildi!");
                loadSubmissions(); 
            } catch (error) {
                console.error("Puanlama hatası:", error);
                alert("İşlem sırasında hata oluştu.");
            }
        };

    } catch (error) {
        console.error("Ödevler yüklenemedi:", error);
    }
}

// Çıkış Yap
document.getElementById('logoutBtn').addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = "login.html";
    });
});

// Soru, Ödev ve Blog Yönetim Listelerini Yükle
async function loadManagementLists() {
    const qList = document.getElementById('manageQuestionsList');
    const aList = document.getElementById('manageAssignmentsList');
    const bList = document.getElementById('manageBlogsList');

    // Soruları Çek
    try {
        const qSnap = await getDocs(query(collection(db, "questions"), orderBy("tarih", "desc")));
        qList.innerHTML = qSnap.empty ? '<p class="no-data">Soru yok.</p>' : "";
        qSnap.forEach(qDoc => {
            const data = qDoc.data();
            const card = document.createElement('div');
            card.className = 'manage-card';
            card.innerHTML = `
                <div class="manage-info">
                    <h4>${data.baslik}</h4>
                    <p>${data.soru_metni.substring(0, 30)}...</p>
                </div>
                <button class="toggle-btn ${data.aktif ? 'aktif' : 'pasif'}" onclick="toggleStatus('questions', '${qDoc.id}', ${data.aktif})">
                    ${data.aktif ? 'Aktif' : 'Pasif'}
                </button>
            `;
            qList.appendChild(card);
        });
    } catch (e) { console.error(e); }

    // Ödevleri Çek
    try {
        const aSnap = await getDocs(query(collection(db, "assignments"), orderBy("tarih", "desc")));
        aList.innerHTML = aSnap.empty ? '<p class="no-data">Ödev yok.</p>' : "";
        aSnap.forEach(aDoc => {
            const data = aDoc.data();
            const card = document.createElement('div');
            card.className = 'manage-card';
            card.innerHTML = `
                <div class="manage-info">
                    <h4>${data.baslik}</h4>
                    <p>${data.aciklama.substring(0, 30)}...</p>
                </div>
                <button class="toggle-btn ${data.aktif ? 'aktif' : 'pasif'}" onclick="toggleStatus('assignments', '${aDoc.id}', ${data.aktif})">
                    ${data.aktif ? 'Aktif' : 'Pasif'}
                </button>
            `;
            aList.appendChild(card);
        });
    } catch (e) { console.error(e); }

    // Blogları Çek
    try {
        if (bList) {
            const bSnap = await getDocs(query(collection(db, "bloglar"), orderBy("tarih", "desc")));
            bList.innerHTML = bSnap.empty ? '<p class="no-data">Blog yok.</p>' : "";
            bSnap.forEach(bDoc => {
                const data = bDoc.data();
                const card = document.createElement('div');
                card.className = 'manage-card';
                card.innerHTML = `
                    <div class="manage-info">
                        <h4>${data.baslik}</h4>
                        <p>${data.icerik.replace(/<[^>]*>?/gm, '').substring(0, 30)}...</p>
                    </div>
                    <button class="toggle-btn pasif" onclick="deleteBlog('${bDoc.id}')" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.2);">
                        Sil
                    </button>
                `;
                bList.appendChild(card);
            });
        }
    } catch (e) { console.error(e); }
}

// Blog Silme
window.deleteBlog = async (id) => {
    if (!confirm("Bu blog yazısını silmek istediğinize emin misiniz?")) return;
    try {
        await deleteDoc(doc(db, "bloglar", id));
        alert("Blog başarıyla silindi.");
        loadManagementLists();
    } catch (e) {
        alert("Silinemedi: " + e.message);
    }
};

// Global Toggle Fonksiyonu
window.toggleStatus = async (coll, id, currentStatus) => {
    try {
        await updateDoc(doc(db, coll, id), {
            aktif: !currentStatus
        });
        loadManagementLists();
        loadStudentReplies();
    } catch (e) {
        alert("Güncellenemedi: " + e.message);
    }
};

// Öğrenci Cevaplarını Yükle
async function loadStudentReplies() {
    const listDiv = document.getElementById('studentRepliesList');
    try {
        const q = query(collection(db, "submissions"), where("durum", "==", "itiraz-edildi"), orderBy("tarihReply", "desc"));
        const querySnapshot = await getDocs(q);
        
        listDiv.innerHTML = querySnapshot.empty ? '<p class="no-data">Henüz yeni bir mesaj yok.</p>' : "";
        querySnapshot.forEach((subDoc) => {
            const data = subDoc.data();
            const id = subDoc.id;
            const card = document.createElement('div');
            card.className = 'submission-card';
            card.innerHTML = `
                <div class="sub-header">
                    <div class="sub-user">
                        <h4>${data.adSoyad}</h4>
                        <p>${data.odevKodu} (Puan: ${data.puan})</p>
                    </div>
                    <div class="sub-date">${data.tarihReply ? data.tarihReply.toDate().toLocaleString('tr-TR') : ''}</div>
                </div>
                <div style="margin-bottom: 10px; white-space: pre-wrap;"><strong>Admin:</strong> ${data.feedback}</div>
                <div class="sub-content" style="border-left: 3px solid #3b82f6; background: rgba(59, 130, 246, 0.05);">
                    <strong>Öğrenci:</strong> ${data.studentReply}
                </div>
                <div class="puanlama-row">
                    <textarea id="admin-reply-${id}" placeholder="Cevap yazın..." style="width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff;"></textarea>
                    <button class="btn-approve" onclick="replyToStudent('${id}')">Gönder</button>
                </div>
            `;
            listDiv.appendChild(card);
        });
    } catch (e) { console.error(e); }
}

// Öğrenciye Cevap Yaz
window.replyToStudent = async (subId) => {
    const msg = document.getElementById(`admin-reply-${subId}`).value;
    if (!msg) return;

    try {
        const docSnap = await getDoc(doc(db, "submissions", subId));
        const subData = docSnap.data();

        await updateDoc(doc(db, "submissions", subId), {
            feedback: msg, 
            durum: "okundu",
            tarihFeedback: serverTimestamp()
        });

        // EmailJS Bildirimi
        try {
            await emailjs.send("service_1zse5dr", "template_qkbrjzn", {
                to_email: subData.userEmail || "daykul75@gmail.com",
                subject: "YGT: Eğitmenden Yeni Mesaj",
                message: `Eğitmen ödevinle ilgili mesajına cevap verdi: ${msg}`,
                user_name: subData.adSoyad,
                email: subData.userEmail || "daykul75@gmail.com",
                link: window.location.origin
            });
        } catch (emailError) {
            console.error("EmailJS Hatası:", emailError);
        }

        alert("Cevabınız gönderildi.");
        loadStudentReplies();
    } catch (e) { alert(e.message); }
};
