import { db } from "../main/veritabani-ayarlari.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { loadManagementLists } from "./yonetici-listeleri.js";

export function initAdminForms() {
    // Blog Ekleme Mantığı
    const addBlogForm = document.getElementById('addBlogForm');
    if (addBlogForm) {
        addBlogForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = document.getElementById('blogSubmitBtn');
            const originalText = submitBtn.innerText;

            const baslik = document.getElementById('bBaslik').value;
            const yazar = document.getElementById('bYazar').value;
            const icerik = document.getElementById('bIcerik').value;
            const fotoIsim = document.getElementById('bFotoIsim').value;

            try {
                submitBtn.innerText = "Yayınlanıyor...";
                submitBtn.disabled = true;

                // Firestore'a kaydet (Sadece dosya ismini tutuyoruz)
                await addDoc(collection(db, "bloglar"), {
                    baslik,
                    yazar,
                    fotoUrl: fotoIsim, // Sadece dosya adı
                    icerik,
                    tarih: serverTimestamp() // serverin saatini alır
                });

                alert("Blog yazısı başarıyla yayınlandı! Lütfen fotoğrafı 'foto' klasörüne eklemeyi unutmayın.");
                addBlogForm.reset();
                loadManagementLists();

            } catch (error) {
                console.error("Hata:", error);
                alert("Blog eklenirken bir hata oluştu: " + error.message);
            } finally {
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Soru Ekleme Mantığı
    const addQuestionForm = document.getElementById('addQuestionForm');
    if (addQuestionForm) {
        addQuestionForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const baslik = document.getElementById('qBaslik').value;
            const metin = document.getElementById('qMetin').value;
            const dogru = document.getElementById('qDogru').value;
            const secenekler = Array.from(document.querySelectorAll('.qSecenek')).map(i => i.value);

            try {
                await addDoc(collection(db, "questions"), {
                    baslik,
                    soru_metni: metin,
                    secenekler,
                    dogruCevap: dogru,
                    aktif: true,
                    tarih: new Date().toISOString()
                });

                alert("Soru başarıyla eklendi!");
                addQuestionForm.reset();
                loadManagementLists();
            } catch (error) {
                alert("Hata: " + error.message);
            }
        });
    }

    // Ödev Yayınlama Mantığı
    const addAssignmentForm = document.getElementById('addAssignmentForm');
    if (addAssignmentForm) {
        addAssignmentForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const baslik = document.getElementById('aBaslik').value;
            const metin = document.getElementById('aMetin').value;

            try {
                await addDoc(collection(db, "assignments"), {
                    baslik,
                    aciklama: metin,
                    aktif: true,
                    tarih: serverTimestamp()
                });

                alert("Ödev başarıyla yayınlandı!");
                addAssignmentForm.reset();
                loadManagementLists();
            } catch (error) {
                alert("Hata: " + error.message);
            }
        });
    }

    // Video Ekleme Mantığı
    const addVideoForm = document.getElementById('addVideoForm');
    if (addVideoForm) {
        addVideoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const baslik = document.getElementById('vBaslik').value;
            const seriIsmi = document.getElementById('vSeri').value;
            let url = document.getElementById('vUrl').value;
            const aciklama = document.getElementById('vAciklama').value;

            // YouTube Linkini Otomatik Düzenle (watch -> embed)
            if (url.includes("watch?v=")) {
                url = url.replace("watch?v=", "embed/").split("&")[0];
            } else if (url.includes("youtu.be/")) {
                url = url.replace("youtu.be/", "www.youtube.com/embed/").split("?")[0];
            }

            try {
                await addDoc(collection(db, "videos"), {
                    baslik,
                    seriIsmi,
                    url,
                    aciklama,
                    tarih: serverTimestamp()
                });
                alert("Video başarıyla eklendi!");
                addVideoForm.reset();
                loadManagementLists();
            } catch (error) {
                alert("Hata: " + error.message);
            }
        });
    }
}
