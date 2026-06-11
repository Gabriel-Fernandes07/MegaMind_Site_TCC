// suporte.js — Ajuda e Suporte MegaMind
// Pega o email do usuário logado via Firebase e envia para lucasblins19@gmail.com

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ── Config Firebase (mesma do auth.js) ──
const firebaseConfig = {
    apiKey: "AIzaSyAXoLRatnIuZSEXYENjFGWgloV3-xaDf9Q",
    authDomain: "megamindapp-4e60c.firebaseapp.com",
    projectId: "megamindapp-4e60c",
    storageBucket: "megamindapp-4e60c.firebasestorage.app",
    messagingSenderId: "114881660257",
    appId: "1:114881660257:web:d0b6ae935486429bfb3120"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);

const EMAIL_SUPORTE = 'lucasblins19@gmail.com';

// Email do usuário logado — preenchido quando Firebase responde
let emailUsuarioLogado = '';

// Aguarda o Firebase identificar o usuário
onAuthStateChanged(auth, (user) => {
    if (user) {
        emailUsuarioLogado = user.email || '';

        // Exibe o email na página para o usuário saber qual será enviado
        const emailDisplay = document.getElementById('email-usuario-display');
        if (emailDisplay) {
            emailDisplay.textContent = emailUsuarioLogado;
            emailDisplay.closest('.email-usuario-box')?.style.setProperty('display', 'flex');
        }
    } else {
        // Não logado — redireciona para login
        window.location.href = 'index.html';
    }
});

// ── UI ──
const UI = {
    assunto:   document.getElementById('suporte-assunto'),
    detalhes:  document.getElementById('suporte-detalhes'),
    contador:  document.getElementById('char-atual'),
    btnEnviar: document.getElementById('btn-enviar'),
    btnTexto:  document.getElementById('btn-texto'),
    status:    document.getElementById('suporte-status'),
    statusIcon:document.getElementById('status-icon'),
    statusMsg: document.getElementById('status-msg'),
    chips:     document.querySelectorAll('.assunto-chip')
};

// Contador de caracteres
UI.detalhes.addEventListener('input', () => {
    UI.contador.textContent = UI.detalhes.value.length;
});

// Chips → select
UI.chips.forEach(chip => {
    chip.addEventListener('click', () => {
        UI.chips.forEach(c => c.classList.remove('selecionado'));
        chip.classList.add('selecionado');
        UI.assunto.value = chip.dataset.assunto;
    });
});

// Select → chips
UI.assunto.addEventListener('change', () => {
    UI.chips.forEach(chip => {
        chip.classList.toggle('selecionado', chip.dataset.assunto === UI.assunto.value);
    });
});

// ── Enviar ──
UI.btnEnviar.addEventListener('click', () => {
    const assunto  = UI.assunto.value.trim();
    const detalhes = UI.detalhes.value.trim();

    if (!assunto) {
        mostrarStatus('erro', 'Por favor, selecione um assunto.');
        UI.assunto.focus();
        return;
    }

    if (detalhes.length < 10) {
        mostrarStatus('erro', 'Descreva o problema com pelo menos 10 caracteres.');
        UI.detalhes.focus();
        return;
    }

    // Dados do usuário
    const nomeUsuario   = localStorage.getItem('megamind_nome')   || 'Usuário';
    const handleUsuario = localStorage.getItem('megamind_handle') || 'sem nickname';
    const emailUsuario  = emailUsuarioLogado || 'email não disponível';

    // Monta o corpo do email
    const corpoEmail =
        'Olá equipe MegaMind,%0A%0A' +
        '=== DADOS DO USUÁRIO ===%0A' +
        'Nome: '    + encodeURIComponent(nomeUsuario)    + '%0A' +
        'Nickname: @' + encodeURIComponent(handleUsuario) + '%0A' +
        'E-mail: '  + encodeURIComponent(emailUsuario)   + '%0A%0A' +
        '=== DETALHES DO PROBLEMA ===%0A%0A' +
        encodeURIComponent(detalhes) + '%0A%0A' +
        '----%0A' +
        'Enviado pela página de Ajuda e Suporte do MegaMind.';

    const assuntoCodificado = encodeURIComponent('[MegaMind Suporte] ' + assunto);

    const mailtoLink =
        'mailto:' + EMAIL_SUPORTE +
        '?subject=' + assuntoCodificado +
        '&body='    + corpoEmail;

    // Abre cliente de email
    window.location.href = mailtoLink;

    UI.btnEnviar.disabled    = true;
    UI.btnTexto.textContent  = 'Abrindo seu e-mail...';

    mostrarStatus(
        'sucesso',
        'Seu cliente de e-mail foi aberto com a mensagem preenchida incluindo seu e-mail (' + emailUsuario + '). Clique em Enviar no seu e-mail!'
    );

    setTimeout(() => {
        UI.btnEnviar.disabled   = false;
        UI.btnTexto.textContent = 'Enviar para o suporte';
    }, 5000);
});

// ── Helper ──
function mostrarStatus(tipo, mensagem) {
    UI.status.className    = 'suporte-status ' + tipo;
    UI.statusMsg.textContent = mensagem;

    UI.statusIcon.innerHTML = tipo === 'sucesso'
        ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 4 12 14.01l-3-3" stroke-linecap="round" stroke-linejoin="round"/>'
        : '<circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01" stroke-linecap="round"/>';
}
