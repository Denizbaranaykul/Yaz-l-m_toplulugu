import { db } from "./veritabani-ayarlari.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- 3. FOOTER İLETİŞİM FORMU İŞLEMLERİ ---
export function initContactForm() {
    const footerForm = document.getElementById('footerForm');

    if (footerForm) {
        footerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = document.getElementById('footerSubmitBtn');
            const originalText = submitBtn.innerText;

            // Butonu kilitle
            submitBtn.innerText = "Gönderiliyor...";
            submitBtn.disabled = true;

            // Verileri al
            const name = document.getElementById('footerName').value;
            const msg = document.getElementById('footerMsg').value;

            try {
                // 'iletisim_mesajlari' koleksiyonuna ekle
                await addDoc(collection(db, "iletisim_mesajlari"), {
                    adSoyad: name,
                    mesaj: msg,
                    tarih: new Date().toLocaleString()
                });

                alert("Mesajınız bize ulaştı. Teşekkürler!");
                footerForm.reset();

            } catch (error) {
                console.error("Hata:", error);
                alert("Bir hata oluştu. Lütfen tekrar deneyin.");
            } finally {
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}
