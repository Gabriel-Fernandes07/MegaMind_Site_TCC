document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    function activateTab(targetId) {
        const targetContent = document.getElementById(targetId);
        if (!targetContent) {
            return;
        }

        tabButtons.forEach((button) => {
            const isActive = button.dataset.target === targetId;
            button.classList.toggle('ativo', isActive);
            button.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        tabContents.forEach((content) => {
            const isTarget = content.id === targetId;
            content.classList.toggle('ativo', isTarget);
        });
    }

    tabButtons.forEach((button) => {
        button.addEventListener('click', (event) => {
            const targetId = event.currentTarget.dataset.target;
            if (!targetId) return;
            activateTab(targetId);
            window.history.replaceState(null, '', `#${targetId}`);
        });
    });

    const hash = window.location.hash.replace('#', '');
    const initialTab = document.getElementById(hash) ? hash : (tabButtons[0] && tabButtons[0].dataset.target);
    if (initialTab) {
        activateTab(initialTab);
    }
});
