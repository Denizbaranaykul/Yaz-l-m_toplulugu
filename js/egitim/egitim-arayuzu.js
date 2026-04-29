export function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
        btn.onclick = () => {
            const targetTab = btn.getAttribute('data-tab');

            // Temizlik
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => {
                c.classList.remove('active');
                c.style.display = 'none';
            });

            // Aktifleştirme
            btn.classList.add('active');
            const target = document.getElementById(targetTab);
            if (target) {
                target.classList.add('active');
                target.style.display = 'block';
            }
        };
    });
}
