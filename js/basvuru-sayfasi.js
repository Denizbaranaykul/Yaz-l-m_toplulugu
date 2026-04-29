// =========================================================
// basvuru.js
// =========================================================

// --- 1. FIREBASE SDK'LARINI İÇE AKTARMA ---
// Firestore ve Firebase Core için gerekli fonksiyonlar
import { db } from "./main/veritabani-ayarlari.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- 4. FORM VE BUTON ELEMENTLERİNİ SEÇME ---
const form = document.getElementById('basvuruForm');
const submitBtn = document.querySelector('.submit-btn');

// --- 5. FORM GÖNDERME OLAYI DİNLEYİCİSİ ---
form.addEventListener('submit', async (e) => {
    e.preventDefault(); // sayfanın varsayılan yenılenmesını engelle 
                        // bunu yapmazsak firebase'e veriler gitmiyor

    // Buton durumunu güncelle (Gönderiliyor...)
    const originalText = submitBtn.innerText;
    submitBtn.innerText = "Gönderiliyor...";
    submitBtn.disabled = true;

    // --- 6. FORM VERİLERİNİ TOPLAMA ---
    const formData = {
        adSoyad: document.getElementById('adsoyad').value,
        bolum: document.getElementById('bolum').value,
        // Radio button'ın seçili değerini alır
        sinif: document.querySelector('input[name="sinif"]:checked')?.value || 'Belirtilmedi',
        yas: document.getElementById('yas').value,
        telefon: document.getElementById('telefon').value,
        email: document.getElementById('email').value,
        departman: document.getElementById('departman').value,
        soruDepartman: document.getElementById('soru_departman').value,
        soruYazilim: document.getElementById('soru_yazilim').value,
        soruHobi: document.getElementById('soru_hobi').value,
        soruFikir: document.getElementById('soru_fikir').value,
        basvuruTarihi: new Date().toLocaleString()  // Başvuru tarihini ekleme
    };

    // --- 7. VERİYİ FIRESTORE'A KAYDETME ---
    try {
        // 'basvurular' koleksiyonuna yeni bir belge ekler
        const docRef = await addDoc(collection(db, "basvurular"), formData);

        // Başarılı bildirim
        alert("Başvurunuz başarıyla alındı! Teşekkürler.");
        form.reset(); // Form alanlarını temizle

    } catch (error) {
        // Hata durumunda konsola log atma ve kullanıcıya bildirme
        console.error("Başvuru gönderme sırasında hata oluştu: ", error);
        alert("Bir hata oluştu. Lütfen tekrar deneyiniz. Konsolu kontrol edin.");
    } finally {
        // Buton durumunu eski haline getir
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
    }
    
});