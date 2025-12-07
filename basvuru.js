// =========================================================
// basvuru.js
// =========================================================

// --- 1. FIREBASE SDK'LARINI İÇE AKTARMA ---
// Firestore ve Firebase Core için gerekli fonksiyonlar
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
// --- 2. FIREBASE YAPILANDIRMASI ---
// UYARI: Bu bilgiler herkese açık olduğu için HASSAS VERİLER DEĞİLDİR,
// ancak bir web projesinin temel bağlantı noktalarıdır.
const firebaseConfig = {
    apiKey: "AIzaSyAPa4-8qVuExM5RP32JcnP2cq5L391uwfU",
    authDomain: "yazilim-gelistirme-web-site.firebaseapp.com",
    projectId: "yazilim-gelistirme-web-site",
    storageBucket: "yazilim-gelistirme-web-site.firebasestorage.app",
    messagingSenderId: "373546414576",
    appId: "1:373546414576:web:6c4c92603dd184c8736d35"
};

// --- 3. FIREBASE VE FIRESTORE'U BAŞLATMA ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Firestore veritabanı servisini başlatır

// --- 4. FORM VE BUTON ELEMENTLERİNİ SEÇME ---
const form = document.getElementById('basvuruForm');
const submitBtn = document.querySelector('.submit-btn');

// --- 5. FORM GÖNDERME OLAYI DİNLEYİCİSİ ---
form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Sayfanın varsayılan yenilenmesini engelle

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
        // Başvuru tarihini ekler
        basvuruTarihi: new Date().toLocaleString()
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