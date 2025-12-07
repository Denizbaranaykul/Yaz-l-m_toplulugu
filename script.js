// =========================================================
// YAZILIM GELİŞTİRME TOPLULUĞU Coded By Deniz Baran Aykul
// =========================================================

// --- Yardımcı Fonksiyonlar ---
function go_to_link(link) {
    window.open(link, "_blank");
}

// --- Header Scroll Efekti (Navbar'ın kararması) ---
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

// --- Smooth Scroll (Yumuşak Kaydırma) ---
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// --- Navbar Linklerine Tıklama Olayı ---
document.addEventListener('DOMContentLoaded', function () {
    const navLinks = document.querySelectorAll('.liste a');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            // Sadece sayfa içi linkler (# ile başlayanlar) için çalışsın
            const href = this.getAttribute('href');
            if (href.includes('#') && !href.includes('.html')) {
                e.preventDefault();
                const targetId = href.substring(1);
                scrollToSection(targetId);
            }
        });
    });
});

// --- INTRO ANİMASYONU YÖNETİMİ ---
window.addEventListener('load', () => {
    // Sayfa yüklenirken scroll'u kilitle
    document.body.style.overflow = 'hidden';

    // 6 saniye sonra intro'yu kaldır ve scroll'u aç
    setTimeout(() => {
        const overlay = document.getElementById('intro-overlay');
        if (overlay) {
            overlay.remove();
        }
        document.body.style.overflow = 'auto';
    }, 6000);
});

// =========================================================
// Deniz Baran Aykul
// =========================================================

const canvas = document.getElementById('matrix-canvas');

// Sadece canvas elementi varsa bu kodu çalıştır
if (canvas) {
    const ctx = canvas.getContext('2d');
    const topElement = document.querySelector('.top');

    let columns = 0;
    const fontSize = 14;
    let drops = [];

    // Canvas boyutunu ve sütunları ayarlayan fonksiyon
    function resizeCanvas() {
        if (topElement) {
            // Canvas genişliğini kapsayıcısına eşitle
            canvas.width = topElement.offsetWidth;
            canvas.height = topElement.offsetHeight;

            // Sütun sayısını yeniden hesapla
            columns = canvas.width / fontSize;

            // Damla dizisini sıfırla ve yeniden doldur
            drops = [];
            for (let i = 0; i < columns; i++) {
                drops[i] = 1;
            }
        }
    }

    // Sayfa yüklendiğinde ve boyut değiştiğinde ayarla
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Matrix Karakterleri
    const chars = '01XY<>/*-+.GIT_CODE_{}[]';
    const charArray = chars.split('');

    function drawMatrix() {
        // Hafif iz bırakmak için şeffaf siyah boya
        ctx.fillStyle = 'rgba(32, 32, 76, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Yazı Rengi (Neon Mavi)
        ctx.fillStyle = '#08a0b4';
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = charArray[Math.floor(Math.random() * charArray.length)];

            // Karakteri çiz
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            // Ekranın altına geldiyse rastgele başa sar
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }

            // Aşağı indir
            drops[i]++;
        }
    }

    // 50ms'de bir çizimi yenile
    setInterval(drawMatrix, 50);
}




document.addEventListener('DOMContentLoaded', () => {

    const container = document.querySelector('.projects-container');



    if (container) {
        // Eğer HTML'de buton yoksa, JS ile oluşturup ekleyelim (Otomatik çözüm)
        let prevBtn = document.querySelector('.left-arrow');
        let nextBtn = document.querySelector('.right-arrow');

        if (!prevBtn && !nextBtn) {
            // Butonlar HTML'de yoksa, onları container'ın dışına ekleyelim
            const wrapper = document.createElement('div');
            wrapper.className = 'carousel-wrapper';

            // Container'ı wrapper içine al (DOM manipülasyonu)
            container.parentNode.insertBefore(wrapper, container);
            wrapper.appendChild(container);

            // Butonları oluştur
            prevBtn = document.createElement('button');
            prevBtn.className = 'nav-arrow left-arrow';
            prevBtn.innerHTML = '&#8249;'; // Sol ok işareti

            nextBtn = document.createElement('button');
            nextBtn.className = 'nav-arrow right-arrow';
            nextBtn.innerHTML = '&#8250;'; // Sağ ok işareti

            wrapper.appendChild(prevBtn);
            wrapper.appendChild(nextBtn);
        }

        const cardWidth = 320; // Kart genişliği + margin

        // Sağa kaydır
        nextBtn.addEventListener('click', () => {
            container.scrollLeft += cardWidth;
        });

        // Sola kaydır
        prevBtn.addEventListener('click', () => {
            container.scrollLeft -= cardWidth;
        });
    }
});