import { db, auth } from "../main/veritabani-ayarlari.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { initTabs } from "./yonetici-arayuzu.js";
import { initAdminForms } from "./yonetici-formlari.js";
import { loadManagementLists, initAdminLists } from "./yonetici-listeleri.js";
import { loadSubmissions, loadStudentReplies, initAdminSubmissions } from "./yonetici-odevler.js";

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

    // Yetki varsa yüklenecekler 
    initTabs();
    initAdminForms();
    initAdminLists();
    initAdminSubmissions();

    loadSubmissions();
    loadManagementLists();
    loadStudentReplies();
});

// Çıkış Yap
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => {
            window.location.href = "login.html";
        });
    });
}
