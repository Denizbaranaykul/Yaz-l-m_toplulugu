import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getRemoteConfig } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-remote-config.js";

// Firebase Ayarları
const firebaseConfig = {
    apiKey: "AIzaSyAPa4-8qVuExM5RP32JcnP2cq5L391uwfU",
    authDomain: "yazilim-gelistirme-web-site.firebaseapp.com",
    projectId: "yazilim-gelistirme-web-site",
    storageBucket: "yazilim-gelistirme-web-site.firebasestorage.app",
    messagingSenderId: "373546414576",
    appId: "1:373546414576:web:6c4c92603dd184c8736d35"
};

// Başlat
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const remoteConfig = getRemoteConfig(app);

// Remote Config ayarları (Geliştirme aşamasında önbelleği azaltabilirsiniz)
remoteConfig.settings.minimumFetchIntervalMillis = 3600000;
remoteConfig.defaultConfig = {};

export { app, db, auth, remoteConfig };
