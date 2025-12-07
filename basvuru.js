// --- FIREBASE KURULUMU ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// !!! BURAYI KENDİ FIREBASE BİLGİLERİNLE DOLDUR !!!
const firebaseConfig = {
    apiKey: "SENIN_API_KEY_BURAYA",
    authDomain: "SENIN_PROJEN.firebaseapp.com",
    projectId: "SENIN_PROJE_ID",
    storageBucket: "SENIN_PROJE_BUCKET",
    messagingSenderId: "SENIN_SENDER_ID",
    appId: "SENIN_APP_ID"
};

// Firebase'i Başlat
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- FORM GÖNDERME İŞLEMİ ---
const form = document.getElementById('basvuruForm');

form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Sayfanın yenilenmesini engelle

    const submitBtn = document.querySelector('.submit-btn');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = "Gönderiliyor...";
    submitBtn.disabled = true;

    // Form verilerini al
    const formData = {
        adSoyad: document.getElementById('adsoyad').value,
        bolum: document.getElementById('bolum').value,
        sinif: document.querySelector('input[name="sinif"]:checked').value, // Radio button
        yas: document.getElementById('yas').value,
        telefon: document.getElementById('telefon').value,
        email: document.getElementById('email').value,
        departman: document.getElementById('departman').value,
        soruDepartman: document.getElementById('soru_departman').value,
        soruYazilim: document.getElementById('soru_yazilim').value,
        soruHobi: document.getElementById('soru_hobi').value,
        soruFikir: document.getElementById('soru_fikir').value,
        basvuruTarihi: new Date().toLocaleString() // Tarih saat ekleyelim
    };

    try {
        // 'basvurular' koleksiyonuna veriyi ekle
        const docRef = await addDoc(collection(db, "basvurular"), formData);

        alert("Başvurunuz başarıyla alındı! Teşekkürler.");
        form.reset(); // Formu temizle

    } catch (error) {
        console.error("Hata oluştu: ", error);
        alert("Bir hata oluştu. Lütfen tekrar deneyiniz.");
    } finally {
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
    }
});