// =========================================================
// YAZILIM GELİŞTİRME TOPLULUĞU - ANA SCRIPT
// =========================================================

// --- 1. FIREBASE İÇE AKTARMA (MODÜL) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
    const navLinks = document.querySelectorAll('.liste a');
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