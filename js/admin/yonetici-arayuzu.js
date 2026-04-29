export function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabButtons.length === 0) return;

    tabButtons.forEach(btn => {
        btn.onclick = (e) => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Tüm butonları temizle
            tabButtons.forEach(b => b.classList.remove('active'));
            // Tüm içerikleri gizle
            tabContents.forEach(c => {
                c.classList.remove('active');
                c.style.display = 'none';
            });

            // Seçileni aktif et
            btn.classList.add('active');
            const target = document.getElementById(targetTab);
            if (target) {
                target.classList.add('active');
                target.style.display = 'block';
            }
        };
    });
}
