// =========================================================
// YAZILIM GELİŞTİRME TOPLULUĞU - ANA SCRIPT
// =========================================================

// --- 1. FIREBASE İÇE AKTARMA (MODÜL) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { communityInfo } from "./prompt.js";
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getRemoteConfig, fetchAndActivate, getString } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-remote-config.js";

// --- 2. FIREBASE AYARLARI ---
const firebaseConfig = {
    apiKey: "AIzaSyAPa4-8qVuExM5RP32JcnP2cq5L391uwfU",
    authDomain: "yazilim-gelistirme-web-site.firebaseapp.com",
    projectId: "yazilim-gelistirme-web-site",
    storageBucket: "yazilim-gelistirme-web-site.firebasestorage.app",
    messagingSenderId: "373546414576",
    appId: "1:373546414576:web:6c4c92603dd184c8736d35"
};

// Firebase Başlat
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const remoteConfig = getRemoteConfig(app);

// Remote Config ayarları (Geliştirme aşamasında önbelleği azaltabilirsiniz)
remoteConfig.settings.minimumFetchIntervalMillis = 3600000;

// Varsayılan ayarlar boş bırakıldı, fallback kodu AI kısmında yönetilecek
remoteConfig.defaultConfig = {};

// --- SON BLOGLARI GETİR (ANASAYFA) ---
async function fetchLatestBlogs() {
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

// Sayfa yüklendiğinde çalıştır
document.addEventListener('DOMContentLoaded', fetchLatestBlogs);

// --- 3. FOOTER İLETİŞİM FORMU İŞLEMLERİ ---
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


// --- 4. GENEL SİTE FONKSİYONLARI ---

// Helper: Link açma
window.go_to_link = function (link) {
    window.open(link, "_blank");
}

// Header Scroll Efekti
const header = document.querySelector("header");
if (header) {
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });
}

// Smooth Scroll
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Navbar Link Tıklama
document.addEventListener('DOMContentLoaded', function () {
    const navLinks = document.querySelectorAll('.liste a,.Kuzenzo-resim-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href && href.includes('#') && !href.includes('.html')) {
                e.preventDefault();
                const targetId = href.substring(1);
                scrollToSection(targetId);
            }
        });
    });
});

// Intro Animasyonu
window.addEventListener('load', () => {
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
        const overlay = document.getElementById('intro-overlay');
        if (overlay) {
            overlay.remove();
        }
        document.body.style.overflow = 'auto';
    }, 6000);
});


// --- 5. MATRIX EFEKTİ ---
const canvas = document.getElementById('matrix-canvas');

if (canvas) {
    const ctx = canvas.getContext('2d');
    const topElement = document.querySelector('.top');

    let columns = 0;
    const fontSize = 14;
    let drops = [];

    function resizeCanvas() {
        if (topElement) {
            canvas.width = topElement.offsetWidth;
            canvas.height = topElement.offsetHeight;
            columns = canvas.width / fontSize;
            drops = [];
            for (let i = 0; i < columns; i++) {
                drops[i] = 1;
            }
        }
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const chars = '01XY<>/*-+.GIT_CODE_{}[]';
    const charArray = chars.split('');

    function drawMatrix() {
        ctx.fillStyle = 'rgba(32, 32, 76, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffffff';
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = charArray[Math.floor(Math.random() * charArray.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }
    setInterval(drawMatrix, 50);
}

// --- 6. CAROUSEL VE MOBİL MENÜ ---
document.addEventListener('DOMContentLoaded', () => {
    // Mobil Hamburger Menü
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".liste");

    if (hamburger && navMenu) {
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navMenu.classList.toggle("active");
        });

        document.querySelectorAll(".liste a").forEach(n => n.addEventListener("click", () => {
            hamburger.classList.remove("active");
            navMenu.classList.remove("active");
        }));
    }

    // Carousel
    const container = document.querySelector('.projects-container');
    if (container) {
        let prevBtn = document.querySelector('.left-arrow');
        let nextBtn = document.querySelector('.right-arrow');

        if (!prevBtn && !nextBtn) {
            const wrapper = document.createElement('div');
            wrapper.className = 'carousel-wrapper';
            container.parentNode.insertBefore(wrapper, container);
            wrapper.appendChild(container);

            prevBtn = document.createElement('button');
            prevBtn.className = 'nav-arrow left-arrow';
            prevBtn.innerHTML = '&#8249;';

            nextBtn = document.createElement('button');
            nextBtn.className = 'nav-arrow right-arrow';
            nextBtn.innerHTML = '&#8250;';

            wrapper.appendChild(prevBtn);
            wrapper.appendChild(nextBtn);
        }

        const cardWidth = 320;
        if (nextBtn) nextBtn.addEventListener('click', () => container.scrollLeft += cardWidth);
        if (prevBtn) prevBtn.addEventListener('click', () => container.scrollLeft -= cardWidth);
    }
});

// --- 7. KUZENZO AI SOHBET BOTU ---

let apiKeys = [];
const fallbackKey = "";
let currentKeyIndex = 0;

// Sayfa yüklendiğinde Remote Config'den API anahtarlarını çek
async function initializeRemoteConfig() {
    try {
        await fetchAndActivate(remoteConfig);
        const keysString = getString(remoteConfig, "api_keys");
        if (keysString && keysString !== fallbackKey) {
            // Virgülle ayrılmış anahtarları diziye çevir ve boşlukları temizle
            const fetchedKeys = keysString.split(',').map(key => key.replace(/\s+/g, '')).filter(key => key.length > 0);
            if (fetchedKeys.length > 0) {
                apiKeys = fetchedKeys;
                console.log("Remote Config'den API anahtarları yüklendi.");
            }
        }
    } catch (error) {
        console.error("Remote Config yüklenemedi:", error);
    }

    // Her halükarda fallback anahtarını listenin en sonuna ekle (eğer listede yoksa)
    if (!apiKeys.includes(fallbackKey)) {
        apiKeys.push(fallbackKey);
        console.log("Yedek (fallback) API anahtarı son sıraya eklendi.");
    }
}

// Remote config'i başlat
initializeRemoteConfig();

// Arayüze mesaj ekleyen fonksiyon
function appendMessage(sender, text) {
    const messagesDiv = document.getElementById('messages');
    if (!messagesDiv) return; // Sayfada sohbet kutusu yoksa hata vermesin

    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender === 'user' ? 'user-msg' : 'ai-msg'}`;
    msgDiv.innerText = text;
    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Otomatik aşağı kaydırır
}

// Enter tuşuna basıldığında tetiklenen fonksiyon (HTML görebilsin diye window'a eklendi)
window.handleKeyPress = function (event) {
    if (event.key === 'Enter') {
        window.sendMessage();
    }
}

// Mesaj gönderme fonksiyonu (HTML görebilsin diye window'a eklendi)
window.sendMessage = async function () {
    const inputField = document.getElementById('userInput');
    if (!inputField) return;

    const userMessage = inputField.value.trim();
    if (!userMessage) return;

    // Kullanıcının mesajını ekrana bas ve kutuyu temizle
    appendMessage('user', userMessage);
    inputField.value = '';

    // "Düşünüyor..." efektini ekle
    const loadingId = "loading-" + Date.now();
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML += `<div class="message ai-msg" id="${loadingId}">Düşünüyor...</div>`;

    // AI için soru metnini hazırla
    const promptText = `Topluluk bilgisi:\n${communityInfo}\n\nSoru: ${userMessage}`;

    let attempts = 0;
    let aiResponseText = "";

    // Key limitine takılırsa diğerini deneme döngüsü
    while (attempts < apiKeys.length) {
        try {
            const currentKey = apiKeys[currentKeyIndex];
            const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${currentKey}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: promptText }] }]
                })
            });

            // 429 Too Many Requests (Limit Aşımı) Kontrolü
            if (response.status === 429 && apiKeys.length > 1) {
                console.warn("429 Hatası: Key limitini aştı, diğer key'e geçiliyor...");
                currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
                attempts++;
                continue;
            }

            if (!response.ok) {
                throw new Error(`API Hatası: ${response.status}`);
            }

            const data = await response.json();
            aiResponseText = data.candidates[0].content.parts[0].text;
            break; // Başarılı olursak döngüden çık

        } catch (error) {
            aiResponseText = `Cevap alınamadı: ${error.message}`;
            break;
        }
    }

    if (apiKeys.length === 0) {
        aiResponseText = 'Sistem ayarları yükleniyor veya API erişimi şu an sağlanamıyor. Lütfen sayfayı yenileyip tekrar deneyin.';
    } else if (attempts === apiKeys.length) {
        aiResponseText = 'Tüm API anahtarları limitine ulaştı. Lütfen daha sonra tekrar deneyiniz.';
    }

    // Yükleniyor yazısını sil ve gerçek cevabı bas
    const loadingElement = document.getElementById(loadingId);
    if (loadingElement) loadingElement.remove();

    appendMessage('ai', aiResponseText);
}