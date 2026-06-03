// avatarUpload.js — Upload de foto de perfil (apenas perfil.html)
(function () {
    document.addEventListener('DOMContentLoaded', function () {
        const trigger = document.getElementById('avatar-perfil-trigger');
        const fileInp = document.getElementById('perfil-file-input');
        const img     = document.getElementById('avatar-img');

        if (!trigger || !fileInp || !img) return;

        trigger.addEventListener('click', function () {
            fileInp.click();
        });

        fileInp.addEventListener('change', function () {
            const file = this.files[0];
            if (!file || !file.type.startsWith('image/')) return;

            const reader = new FileReader();
            reader.onload = function (e) {
                img.src = e.target.result;
                img.style.display = 'block';
                const fallback = img.nextElementSibling;
                if (fallback && fallback.tagName === 'svg') {
                    fallback.style.display = 'none';
                }
                try { localStorage.setItem('megamind_avatar', e.target.result); } catch {}

                const t = document.getElementById('mm-toast');
                if (t) {
                    t.textContent = '✅ Foto atualizada!';
                    t.classList.add('show');
                    setTimeout(function () { t.classList.remove('show'); }, 3000);
                }
            };
            reader.readAsDataURL(file);
            this.value = '';
        });
    });
})();
