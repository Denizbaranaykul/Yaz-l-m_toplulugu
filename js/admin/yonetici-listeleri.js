import { db } from "../main/veritabani-ayarlari.js";
import { collection, query, orderBy, getDocs, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { loadStudentReplies } from "./yonetici-odevler.js";

// Soru, Ödev ve Blog Yönetim Listelerini Yükle
export async function loadManagementLists() {
    const qList = document.getElementById('manageQuestionsList');
    const aList = document.getElementById('manageAssignmentsList');
    const bList = document.getElementById('manageBlogsList');
    const vList = document.getElementById('manageVideosList');

    // Videoları Çek
    try {
        if (vList) {
            const vSnap = await getDocs(query(collection(db, "videos"), orderBy("tarih", "desc")));
            vList.innerHTML = vSnap.empty ? '<p class="no-data">Video yok.</p>' : "";
            vSnap.forEach(vDoc => {
                const data = vDoc.data();
                const card = document.createElement('div');
                card.className = 'manage-card';
                card.innerHTML = `
                    <div class="manage-info">
                        <h4>${data.baslik}</h4>
                        <p>${data.url.substring(0, 30)}...</p>
                    </div>
                    <button class="toggle-btn pasif" onclick="deleteItem('videos', '${vDoc.id}')" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.2);">
                        Sil
                    </button>
                `;
                vList.appendChild(card);
            });
        }
    } catch (e) { console.error(e); }
    try {
        if (qList) {
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
        }
    } catch (e) { console.error(e); }

    // Ödevleri Çek
    try {
        if (aList) {
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
        }
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
                    <button class="toggle-btn pasif" onclick="deleteItem('bloglar', '${bDoc.id}')" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.2);">
                        Sil
                    </button>
                `;
                bList.appendChild(card);
            });
        }
    } catch (e) { console.error(e); }
}

export function initAdminLists() {
    // Genel Silme Fonksiyonu
    window.deleteItem = async (coll, id) => {
        if (!confirm("Bunu silmek istediğinize emin misiniz?")) return;
        try {
            await deleteDoc(doc(db, coll, id));
            alert("Başarıyla silindi.");
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
}
