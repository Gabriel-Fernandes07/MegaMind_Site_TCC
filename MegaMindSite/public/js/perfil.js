// perfil.js — Gerenciamento de foto de perfil

const AVATAR_KEY = 'megamind_avatar';

// Carrega a foto salva em qualquer página que tenha #avatar-img
function carregarAvatar() {
    const img = document.getElementById('avatar-img');
    if (!img) return;

    const saved = localStorage.getItem(AVATAR_KEY);
    if (saved) img.src = saved;
}

// Inicializa o upload (só ativa se houver #avatar-input na página)
function inicializarUploadAvatar() {
    const input = document.getElementById('avatar-input');
    const img   = document.getElementById('avatar-img');
    const toast = document.getElementById('avatar-toast');
    if (!input || !img) return;

    input.addEventListener('change', function () {
        const file = this.files[0];
        if (!file || !file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            img.src = e.target.result;
            try {
                localStorage.setItem(AVATAR_KEY, e.target.result);
            } catch {}

            if (toast) {
                toast.classList.add('show');
                setTimeout(() => toast.classList.remove('show'), 3000);
            }
        };
        reader.readAsDataURL(file);
        this.value = '';
    });
}

// Executa ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    carregarAvatar();
    inicializarUploadAvatar();
});