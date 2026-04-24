import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, query, orderBy, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase Ayarları
const firebaseConfig = {
    apiKey: "AIzaSyAPa4-8qVuExM5RP32JcnP2cq5L391uwfU",
    authDomain: "yazilim-gelistirme-web-site.firebaseapp.com",
    projectId: "yazilim-gelistirme-web-site",
    storageBucket: "yazilim-gelistirme-web-site.firebasestorage.app",
    messagingSenderId: "373546414576",
    appId: "1:373546414576:web:6c4c92603dd184c8736d35"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const blogContainer = document.getElementById('blog-container');
const modal = document.getElementById('blogModal');
const modalBody = document.getElementById('modalBody');
const closeBtn = document.querySelector('.close-modal');

// Blogları Getir
async function fetchAllBlogs() {
    if (!blogContainer) return;

    try {
        const q = query(collection(db, "bloglar"), orderBy("tarih", "desc"));
        const querySnapshot = await getDocs(q);
        
        blogContainer.innerHTML = '';
        
        if (querySnapshot.empty) {
            blogContainer.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">Henüz blog yazısı eklenmemiş.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const date = data.tarih?.toDate ? data.tarih.toDate().toLocaleDateString('tr-TR') : data.tarih;
            
            const card = document.createElement('div');
            card.className = 'blog-card';
            card.innerHTML = `
                <div class="blog-card-image">
                    <img src="../foto/${data.fotoUrl || 'logo.png'}" alt="${data.baslik}">
                </div>
                <div class="blog-card-content">
                    <h3>${data.baslik}</h3>
                    <p>${data.icerik.replace(/<[^>]*>?/gm, '').replace(/\*\*/g, '').substring(0, 150)}...</p>
                    <div class="blog-card-footer">
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <span class="blog-date">📅 ${date}</span>
                            <span class="blog-author">👤 ${data.yazar || 'YGT'}</span>
                        </div>
                        <span class="read-more">Devamını Oku →</span>
                    </div>
                </div>
            `;
            
            card.onclick = () => openBlogModal(data);
            blogContainer.appendChild(card);
        });

        // URL parametresini kontrol et (Anasayfadan yönlendirme için)
        const urlParams = new URLSearchParams(window.location.search);
        const blogId = urlParams.get('id');
        if (blogId) {
            openSpecificBlog(blogId);
        }

    } catch (error) {
        console.error("Bloglar yüklenirken hata:", error);
        blogContainer.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">Bloglar yüklenemedi.</p>';
    }
}

// Belirli bir blogu aç
async function openSpecificBlog(blogId) {
    try {
        const docRef = doc(db, "bloglar", blogId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            openBlogModal(docSnap.data());
        }
    } catch (error) {
        console.error("Blog açılırken hata:", error);
    }
}

// Modal Aç
function openBlogModal(data) {
    const date = data.tarih?.toDate ? data.tarih.toDate().toLocaleDateString('tr-TR') : data.tarih;
    
    // Markdown-like Bold İşleme (**metin** -> <strong>metin</strong>)
    let processedContent = data.icerik || "";
    processedContent = processedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    modalBody.innerHTML = `
        <img src="../foto/${data.fotoUrl || 'logo.png'}" alt="${data.baslik}" class="modal-hero-image">
        <div class="modal-body-content">
            <h2>${data.baslik}</h2>
            <div class="modal-meta">
                <span>📅 ${date}</span>
                <span class="yazar-badge">👤 ${data.yazar || 'YGT'}</span>
            </div>
            <div class="modal-text">
                ${processedContent}
            </div>
        </div>
    `;
    
    modal.style.display = "block";
    document.body.style.overflow = "hidden"; // Kaydırmayı engelle
}

// Modal Kapat
if (closeBtn) {
    closeBtn.onclick = () => {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    };
}

window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    }
};

// Başlat
document.addEventListener('DOMContentLoaded', fetchAllBlogs);
