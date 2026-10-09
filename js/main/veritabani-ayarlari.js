import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getRemoteConfig } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-remote-config.js";

// Firebase Ayarları
const firebaseConfig = {
    apiKey: "AIzaSyB_UK8jgneT7HwRs8rquwCllpVmJTjLzNg",
    authDomain: "ygt-site.firebaseapp.com",
    projectId: "ygt-site",
    storageBucket: "ygt-site.firebasestorage.app",
    messagingSenderId: "135655229509",
    appId: "1:135655229509:web:f0d6e2071af6a45e3cbb2c"
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
