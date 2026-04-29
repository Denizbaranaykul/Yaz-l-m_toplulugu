import { db } from "./veritabani-ayarlari.js";
import { collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- SON BLOGLARI GETİR (ANASAYFA) ---
export async function fetchLatestBlogs() {
    const container = document.getElementById('latest-blogs-container');
    if (!container) return;

    try {
        const q = query(collection(db, "bloglar"), orderBy("tarih", "desc"), limit(3));
        const querySnapshot = await getDocs(q);

        container.innerHTML = '';

        if (querySnapshot.empty) {
            container.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">Henüz blog yazısı eklenmemiş.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const date = data.tarih?.toDate ? data.tarih.toDate().toLocaleDateString('tr-TR') : data.tarih;

            const card = `
                <div class="blog-card" onclick="window.location.href='sayfalar/blog.html?id=${doc.id}'">
                    <div class="blog-card-image">
                        <img src="foto/${data.fotoUrl || 'logo.png'}" alt="${data.baslik}">
                    </div>
                    <div class="blog-card-content">
                        <h3>${data.baslik}</h3>
                        <p>${data.icerik.replace(/<[^>]*>?/gm, '').replace(/\*\*/g, '').substring(0, 120)}...</p>
                        <div class="blog-card-footer">
                            <div style="display: flex; flex-direction: column; gap: 4px;">
                                <span class="blog-date">📅 ${date}</span>
                                <span class="blog-author" style="font-size: 0.8rem; color: var(--primary); font-weight: 600;">👤 ${data.yazar || 'YGT'}</span>
                            </div>
                            <span class="read-more">Devamını Oku →</span>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += card;
        });
    } catch (error) {
        console.error("Bloglar yüklenirken hata:", error);
        container.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">Bloglar yüklenemedi.</p>';
    }
}
