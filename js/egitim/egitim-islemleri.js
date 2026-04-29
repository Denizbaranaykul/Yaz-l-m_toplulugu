import { db, auth } from "../main/veritabani-ayarlari.js";
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { state } from "./egitim-durumu.js";
import { loadPastSubmissions } from "./egitim-icerikleri.js";

export function initEgitimActions() {
    // Global fonksiyonlar
    window.checkAnswer = async (qId, selected, btn) => {
        const qDoc = await getDoc(doc(db, "questions", qId));
        const correct = qDoc.data().dogruCevap;
        const feedback = document.getElementById(`feedback-${qId}`);

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

    window.submitReply = async (subId) => {
        const msg = document.getElementById(`reply-${subId}`).value;
        if (!msg) return;

        try {
            await updateDoc(doc(db, "submissions", subId), {
                studentReply: msg,
                durum: "itiraz-edildi",
                tarihReply: serverTimestamp()
            });

            // EmailJS Bildirimi
            try {
                if (window.emailjs && state.currentUserData) {
                    await emailjs.send("service_1zse5dr", "template_qkbrjzn", {
                        to_email: "daykul75@gmail.com",
                        subject: `YGT: Öğrenciden Yeni Mesaj (${state.currentUserData.adSoyad})`,
                        message: `${state.currentUserData.adSoyad} isimli öğrenci ödevi için mesaj gönderdi: ${msg}`,
                        user_name: "YGT Admin",
                        email: "daykul75@gmail.com",
                        link: window.location.origin
                    });
                }
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

    // Ödev Gönderimi
    const submitOdevBtn = document.getElementById('submitOdev');
    if (submitOdevBtn) {
        submitOdevBtn.addEventListener('click', async () => {
            const title = document.getElementById('odevKoduSelect').value;
            const content = document.getElementById('submissionContent').value;
            const user = auth.currentUser;

            if (!title) {
                alert("Lütfen ödev seçiniz.");
                return;
            }
            if (!content) {
                alert("lütfen cevap kısmını doldurunuz.");
                return;
            }

            submitOdevBtn.disabled = true;
            submitOdevBtn.innerText = "Gönderiliyor...";

            try {
                await addDoc(collection(db, "submissions"), {
                    userId: user.uid,
                    adSoyad: state.currentUserData.adSoyad,
                    userEmail: user.email,
                    odevKodu: title,
                    icerik: content,
                    durum: "bekliyor",
                    tarih: serverTimestamp()
                });

                // EmailJS Bildirimi
                try {
                    if (window.emailjs && state.currentUserData) {
                        await emailjs.send("service_1zse5dr", "template_qkbrjzn", {
                            to_email: "daykul75@gmail.com",
                            subject: `YGT: Yeni Ödev Teslim Edildi (${state.currentUserData.adSoyad})`,
                            message: `${state.currentUserData.adSoyad} isimli öğrenci '${title}' başlıklı ödevini teslim etti.`,
                            user_name: "YGT Admin",
                            email: "daykul75@gmail.com",
                            link: window.location.origin
                        });
                    }
                } catch (emailError) {
                    console.error("EmailJS Bildirim Hatası:", emailError);
                }

                alert("Ödeviniz başarıyla gönderildi! Admin onayından sonra puanınız eklenecektir.");
                document.getElementById('odevKoduSelect').value = "";
                document.getElementById('submissionContent').value = "";
            } catch (error) {
                console.error("Ödev gönderim hatası:", error);
                alert("Gönderilemedi: " + error.message);
            } finally {
                submitOdevBtn.disabled = false;
                submitOdevBtn.innerText = "Ödevi Gönder";
            }
        });
    }
}
