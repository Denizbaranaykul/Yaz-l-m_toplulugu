// =========================================================
// YAZILIM GELİŞTİRME TOPLULUĞU - ANA SCRIPT (REFACTORED)
// =========================================================

// Firebase başlatması firebase-config.js içinde yapılıyor
import "./veritabani-ayarlari.js";

import { fetchLatestBlogs } from "./blog-gosterimi.js";
import { initUIInteractions, initIntroAnimation } from "./gorsel-efektler.js";
import { initContactForm } from "./iletisim.js";
import { initChatbot } from "./yapay-zeka.js";

function initAll() {
    fetchLatestBlogs();
    initUIInteractions();
    initContactForm();
    initChatbot();
}

// Sayfa yüklendiğinde çalıştırılacaklar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
} else {
    initAll();
}

// Intro Animasyonu için load event
if (document.readyState === 'complete') {
    initIntroAnimation();
} else {
    window.addEventListener('load', initIntroAnimation);
}