import { db, auth } from "../main/veritabani-ayarlari.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { state } from "./egitim-durumu.js";
import { initTabs } from "./egitim-arayuzu.js";
import { loadVideos, renderVideos, loadLeaderboard, loadQuestions, renderQuestions, loadAssignments, loadPastSubmissions } from "./egitim-icerikleri.js";
import { initEgitimActions } from "./egitim-islemleri.js";

// DOM Elemanları
const welcomeName = document.getElementById('welcomeName');
const userEmail = document.getElementById('userEmail');
const myScore = document.getElementById('myScore');
const logoutBtn = document.getElementById('logoutBtn');
const adminLink = document.getElementById('adminLink');

// Başlat
initTabs();
initEgitimActions();

// Oturum Kontrolü
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    // Kullanıcı verilerini çek
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
        state.currentUserData = userDoc.data();

        if (welcomeName) welcomeName.innerText = `Hoş geldin, ${state.currentUserData.adSoyad}`;
        if (userEmail) userEmail.innerText = user.email;
        if (myScore) myScore.innerText = `${state.currentUserData.score || 0} Puan`;

        if (state.currentUserData.role === 'admin' && adminLink) {
            adminLink.style.display = 'inline-block';
        }
    }

    // Verileri yükle
    loadVideos();
    loadLeaderboard();
    loadQuestions();
    loadAssignments();
    loadPastSubmissions();
});

// Filtre Değişim Dinleyicileri
const videoFilter = document.getElementById('videoFilter');
if (videoFilter) videoFilter.addEventListener('change', (e) => renderVideos(e.target.value));

const questionFilter = document.getElementById('questionFilter');
if (questionFilter) questionFilter.addEventListener('change', (e) => renderQuestions(e.target.value));

// Çıkış Yap
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => {
            window.location.href = "login.html";
        });
    });
}
