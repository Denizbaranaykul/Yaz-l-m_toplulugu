function go_to_link(link) {
    window.open(link, "_blank");
}
const header = document.querySelector("header");

window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }
});

// Smooth scroll fonksiyonu
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Navbar linklerine click event listener ekle
document.addEventListener('DOMContentLoaded', function () {
    const navLinks = document.querySelectorAll('.liste a');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
        });
    });
});

// --- INTRO ANİMASYONU YÖNETİMİ ---
// Sayfa tamamen yüklendiğinde çalışır (Resimler, CSS dahil)
window.addEventListener('load', () => {
    // Scroll'u kilitle
    document.body.style.overflow = 'hidden';

    // 6 saniye bekle ve intro'yu kaldır
    setTimeout(() => {
        const overlay = document.getElementById('intro-overlay');
        if (overlay) {
            overlay.remove(); // HTML'den sil
        }
        // Scroll'u tekrar aç
        document.body.style.overflow = 'auto';
    }, 6000);
});
/* --- MATRIX RAIN EFFECT --- */
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');

// Canvas boyutunu ekran boyutuna eşitle
function resizeCanvas() {
    canvas.width = document.querySelector('.top').offsetWidth;
    canvas.height = document.querySelector('.top').offsetHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Matrix karakterleri (Binary ve teknolojik harfler)
const chars = '01XY<>/*-+.';
const charArray = chars.split('');

const fontSize = 14;
const columns = canvas.width / fontSize;

// Her kolonun y pozisyonunu tutan dizi (başlangıçta hepsi 0)
const drops = [];
for (let i = 0; i < columns; i++) {
    drops[i] = 1;
}

function drawMatrix() {
    // Hafif iz bırakarak temizle (Matrix efekti için)
    ctx.fillStyle = 'rgba(2, 6, 23, 0.05)'; // Sitenin arka plan rengiyle uyumlu
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Yazı rengi (Neon Mavi - Sitenin teması)
    ctx.fillStyle = '#3b82f6';
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
        // Rastgele karakter seç
        const text = charArray[Math.floor(Math.random() * charArray.length)];

        // Ekrana çiz
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Ekranın altına geldiyse veya rastgele bir durumda başa sar
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }

        // Y pozisyonunu artır (aşağı indir)
        drops[i]++;
    }
}

// 50ms'de bir çiz (Hızı buradan ayarlayabilirsin)
setInterval(drawMatrix, 50);