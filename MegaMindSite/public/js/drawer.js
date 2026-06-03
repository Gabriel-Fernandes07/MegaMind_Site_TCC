// drawer.js — Menu lateral (sidebar drawer) da perfil.html
(function () {
    document.addEventListener('DOMContentLoaded', function () {
        const menuBtn  = document.getElementById('perfil-menu-btn');
        const drawer   = document.getElementById('sidebar-drawer');
        const overlay  = document.getElementById('sidebar-overlay');
        const closeBtn = document.getElementById('sidebar-close');

        if (!menuBtn || !drawer) return;

        function openDrawer() {
            drawer.classList.add('open');
            overlay.classList.add('open');
            document.body.style.overflow = 'hidden';
        }

        function closeDrawer() {
            drawer.classList.remove('open');
            overlay.classList.remove('open');
            document.body.style.overflow = '';
        }

        menuBtn.addEventListener('click', openDrawer);
        if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
        if (overlay)  overlay.addEventListener('click', closeDrawer);
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeDrawer();
        });
    });
})();
