import { db, auth } from "../main/veritabani-ayarlari.js";
import { collection, query, where, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { state } from "./egitim-durumu.js";

// Videoları Yükle
export async function loadVideos() {
    const videoFilter = document.getElementById('videoFilter');

    try {
        const q = query(collection(db, "videos"), orderBy("tarih", "desc"));
        const querySnapshot = await getDocs(q);

        state.allVideos = [];
        const series = new Set();

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            state.allVideos.push({ id: doc.id, ...data });
            if (data.seriIsmi) series.add(data.seriIsmi);
        });

        // Filtreyi Doldur
        if (videoFilter) {
            videoFilter.innerHTML = '<option value="all">Tüm Seriler</option>';
            series.forEach(s => {
                videoFilter.innerHTML += `<option value="${s}">${s}</option>`;
            });
        }

        renderVideos('all');
    } catch (error) {
        console.error("Videolar yüklenemedi:", error);
    }
}

export function renderVideos(filter) {
    const videoGrid = document.getElementById('videoGrid');
    if (!videoGrid) return;

    const filtered = filter === 'all' ? state.allVideos : state.allVideos.filter(v => v.seriIsmi === filter);

    if (filtered.length === 0) {
        videoGrid.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 20px; grid-column: 1/-1;">Bu seride henüz video bulunmuyor.</p>';
        return;
    }

    videoGrid.innerHTML = "";
    filtered.forEach((data) => {
        const vDiv = document.createElement('div');
        vDiv.className = 'video-card glass-panel';
        vDiv.innerHTML = `
            <div class="video-wrapper">
                <iframe 
                    src="${data.url}" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    referrerpolicy="strict-origin-when-cross-origin"
                    allowfullscreen>
                </iframe>
            </div>
            <h4>${data.baslik}</h4>
            <p>${data.aciklama}</p>
        `;
        videoGrid.appendChild(vDiv);
    });
}

// Liderlik Tablosunu Yükle
export async function loadLeaderboard() {
    const leaderboardContainer = document.getElementById('leaderboardContainer');
    if (!leaderboardContainer) return;

    try {
        const q = query(collection(db, "users"), orderBy("score", "desc"), limit(10));
        const querySnapshot = await getDocs(q);

        leaderboardContainer.innerHTML = "";
        let rank = 1;

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const item = document.createElement('li');
            item.className = 'leaderboard-item';
            item.innerHTML = `
                <span class="rank">#${rank}</span>
                <span class="student-name">${data.adSoyad}</span>
                <span class="score">${data.score || 0} Puan</span>
            `;
            leaderboardContainer.appendChild(item);
            rank++;
        });
    } catch (error) {
        console.error("Leaderboard yükleme hatası:", error);
    }
}

// Soruları Yükle
export async function loadQuestions() {
    const questionFilter = document.getElementById('questionFilter');

    try {
        const q = query(collection(db, "questions"), where("aktif", "==", true));
        const querySnapshot = await getDocs(q);

        state.allQuestions = [];
        const categories = new Set();

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            state.allQuestions.push({ id: doc.id, ...data });
            if (data.baslik) categories.add(data.baslik);
        });

        // Filtreyi Doldur
        if (questionFilter) {
            questionFilter.innerHTML = '<option value="all">Tüm Konular</option>';
            categories.forEach(c => {
                questionFilter.innerHTML += `<option value="${c}">${c}</option>`;
            });
        }

        renderQuestions('all');
    } catch (error) {
        console.error("Sorular yüklenemedi:", error);
    }
}

export function renderQuestions(filter) {
    const questionsContainer = document.getElementById('questionsContainer');
    if (!questionsContainer) return;

    const filtered = filter === 'all' ? state.allQuestions : state.allQuestions.filter(q => q.baslik === filter);

    questionsContainer.innerHTML = "";
    if (filtered.length === 0) {
        questionsContainer.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 20px;">Bu konuda soru bulunmuyor.</p>';
        return;
    }

    filtered.forEach((data) => {
        const qId = data.id;
        const qDiv = document.createElement('div');
        qDiv.className = 'question-item';

        let optionsHtml = "";
        data.secenekler.forEach((opt) => {
            optionsHtml += `<button class="option-btn" onclick="checkAnswer('${qId}', '${opt}', this)">${opt}</button>`;
        });

        qDiv.innerHTML = `
            <div class="question-text">${data.baslik}: ${data.soru_metni}</div>
            <div class="options-grid">${optionsHtml}</div>
            <div id="feedback-${qId}" style="margin-top: 10px; font-weight: 600; display: none;"></div>
        `;
        questionsContainer.appendChild(qDiv);
    });
}

// Ödevleri Yükle
export async function loadAssignments() {
    const assignmentsContainer = document.getElementById('assignmentsContainer');
    const odevSelect = document.getElementById('odevKoduSelect');
    if (!assignmentsContainer || !odevSelect) return;

    try {
        const q = query(collection(db, "assignments"), where("aktif", "==", true), orderBy("tarih", "desc"));
        const querySnapshot = await getDocs(q);

        assignmentsContainer.innerHTML = "";
        odevSelect.innerHTML = '<option value="">Ödev Seçiniz...</option>';

        if (querySnapshot.empty) {
            assignmentsContainer.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 20px;">Henüz aktif ödev yayınlanmamış.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();

            // Eğitim Sayfasında Listele
            const aDiv = document.createElement('div');
            aDiv.className = 'question-item';
            aDiv.innerHTML = `
                <div class="question-text" style="color: #3b82f6; font-size: 1.1rem;">${data.baslik}</div>
                <div style="color: #e2e8f0; line-height: 1.6; white-space: pre-wrap;">${data.aciklama}</div>
            `;
            assignmentsContainer.appendChild(aDiv);

            // Select Kutusuna Ekle
            const opt = document.createElement('option');
            opt.value = data.baslik;
            opt.innerText = data.baslik;
            odevSelect.appendChild(opt);
        });
    } catch (error) {
        console.error("Ödevler yüklenemedi:", error);
    }
}

// Geçmiş Ödevleri ve Geri Bildirimleri Yükle
export async function loadPastSubmissions() {
    const container = document.getElementById('pastSubmissionsContainer');
    if (!container) return;

    const user = auth.currentUser;
    if (!user) return;

    try {
        const q = query(
            collection(db, "submissions"),
            where("userId", "==", user.uid),
            where("durum", "in", ["okundu", "itiraz-edildi", "tamamlandi"]),
            orderBy("puanlanmaTarihi", "desc")
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) return;

        container.innerHTML = "";
        querySnapshot.forEach((subDoc) => {
            const data = subDoc.data();
            const id = subDoc.id;

            const div = document.createElement('div');
            div.className = 'question-item';
            div.style.marginBottom = "20px";
            div.style.borderLeft = "4px solid #3b82f6";

            let replyHtml = "";
            if (data.durum === "okundu") {
                replyHtml = `
                    <div style="margin-top: 15px; display: flex; gap: 10px;">
                        <textarea id="reply-${id}" placeholder="Admin'e cevap yazın veya itiraz edin..." style="flex: 1; height: 60px; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; outline: none;"></textarea>
                        <div style="display: flex; flex-direction: column; gap: 5px;">
                            <button class="btn-sm-secondary" style="background: #3b82f6; color: #fff; padding: 8px 15px;" onclick="submitReply('${id}')">Gönder</button>
                            <button class="btn-sm-secondary" style="background: rgba(34, 197, 94, 0.2); color: #22c55e; border: 1px solid #22c55e; padding: 8px 15px;" onclick="completeConversation('${id}')">Teşekkür Et & Bitir</button>
                        </div>
                    </div>
                `;
            } else if (data.durum === "itiraz-edildi") {
                replyHtml = `<div style="margin-top: 10px; color: #fbbf24; font-size: 0.85rem; font-style: italic;">Cevabınız iletildi, admin bekleniyor...</div>`;
            } else if (data.durum === "tamamlandi") {
                replyHtml = `<div style="margin-top: 10px; color: #22c55e; font-size: 0.85rem; font-weight: 600;">✅ Konuşma başarıyla tamamlandı.</div>`;
            }

            div.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <strong style="color: #3b82f6;">${data.odevKodu}</strong>
                    <span class="score">${data.puan} Puan</span>
                </div>
                <div style="font-size: 0.9rem; color: #94a3b8; margin-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 5px;">
                    <strong>Senin Kodun:</strong><br>${data.icerik.substring(0, 50)}...
                </div>
                <div style="background: rgba(59, 130, 246, 0.1); padding: 12px; border-radius: 8px; white-space: pre-wrap;">
                    <strong style="color: #60a5fa;">Admin Notu:</strong><br>
                    ${data.feedback || "Geri bildirim bırakılmadı."}
                </div>
                ${data.studentReply ? `<div style="margin-top: 10px; padding-left: 10px; border-left: 2px solid #64748b; font-size: 0.85rem; color: #94a3b8; white-space: pre-wrap;"><strong>Senin Cevabın:</strong> ${data.studentReply}</div>` : ""}
                ${replyHtml}
            `;
            container.appendChild(div);
        });

    } catch (error) {
        console.error("Geçmiş ödevler yüklenemedi:", error);
    }
}
