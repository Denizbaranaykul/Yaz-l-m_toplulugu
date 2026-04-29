import { db, auth } from "./main/veritabani-ayarlari.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// DOM Elemanları
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authSubtitle = document.getElementById('authSubtitle');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');

// Sekme Değiştirme Mantığı
loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    authSubtitle.innerText = "Tekrar hoş geldiniz!";
});

registerTab.addEventListener('click', () => {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.style.display = 'block';
    loginForm.style.display = 'none';
    authSubtitle.innerText = "Topluluğumuza katılın!";
});

// Kayıt İşlemi
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    // const btn = document.getElementById('registerBtn'); // Global kullanılıyor

    registerBtn.disabled = true;
    registerBtn.innerText = "Kaydediliyor...";

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Firestore'a kullanıcı bilgilerini kaydet
        await setDoc(doc(db, "users", user.uid), {
            adSoyad: name,
            email: email,
            role: "student",
            score: 0,
            kayitTarihi: new Date().toISOString()
        });

        alert("Kayıt başarılı! Eğitim sayfasına yönlendiriliyorsunuz.");
        window.location.href = "egitim.html";
    } catch (error) {
        console.error("Kayıt Hatası:", error);
        alert("Hata: " + error.message);
    } finally {
        registerBtn.disabled = false;
        registerBtn.innerText = "Kayıt Ol";
    }
});

// Giriş İşlemi
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    // const btn = document.getElementById('loginBtn'); // Global kullanılıyor

    loginBtn.disabled = true;
    loginBtn.innerText = "Giriş yapılıyor...";

    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "egitim.html";
    } catch (error) {
        console.error("Giriş Hatası:", error);
        alert("Giriş başarısız: " + error.message);
    } finally {
        loginBtn.disabled = false;
        loginBtn.innerText = "Giriş Yap";
    }
});

// Oturum Kontrolü (Sadece sayfa ilk açıldığında çalışır)
onAuthStateChanged(auth, (user) => {
    // Eğer kullanıcı zaten giriş yapmışsa ve manuel bir işlem (kayıt/giriş) yapmıyorsa yönlendir
    const isProcessing = loginBtn.disabled || registerBtn.disabled;
    if (user && window.location.pathname.includes('login.html') && !isProcessing) {
        window.location.href = "egitim.html";
    }
});
