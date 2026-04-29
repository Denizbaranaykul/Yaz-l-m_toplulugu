import { remoteConfig } from "./veritabani-ayarlari.js";
import { fetchAndActivate, getString } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-remote-config.js";
import { communityInfo } from "./prompt.js";

// --- 7. KUZENZO AI SOHBET BOTU ---
export function initChatbot() {
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
}
