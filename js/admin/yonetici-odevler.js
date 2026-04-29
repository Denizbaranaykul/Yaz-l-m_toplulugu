import { db } from "../main/veritabani-ayarlari.js";
import { collection, query, where, orderBy, getDocs, doc, getDoc, updateDoc, writeBatch, serverTimestamp, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Bekleyen Ödevleri Yükle
export async function loadSubmissions() {
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

    } catch (error) {
        console.error("Ödevler yüklenemedi:", error);
    }
}

// Öğrenci Cevaplarını Yükle
export async function loadStudentReplies() {
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

export function initAdminSubmissions() {
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
                if (window.emailjs) {
                    await emailjs.send("service_1zse5dr", "template_qkbrjzn", {
                        to_email: data.userEmail || "daykul75@gmail.com",
                        subject: "YGT: Ödevin Puanlandı!",
                        message: `Merhaba ${data.adSoyad}, '${data.odevKodu}' başlıklı ödevin puanlandı. Puanın: ${puan}. Not: ${feedback}`,
                        user_name: data.adSoyad,
                        email: data.userEmail || "daykul75@gmail.com",
                        link: window.location.origin
                    });
                }
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
                if (window.emailjs) {
                    await emailjs.send("service_1zse5dr", "template_qkbrjzn", {
                        to_email: subData.userEmail || "daykul75@gmail.com",
                        subject: "YGT: Eğitmenden Yeni Mesaj",
                        message: `Eğitmen ödevinle ilgili mesajına cevap verdi: ${msg}`,
                        user_name: subData.adSoyad,
                        email: subData.userEmail || "daykul75@gmail.com",
                        link: window.location.origin
                    });
                }
            } catch (emailError) {
                console.error("EmailJS Hatası:", emailError);
            }

            alert("Cevabınız gönderildi.");
            loadStudentReplies();
        } catch (e) { alert(e.message); }
    };
}
