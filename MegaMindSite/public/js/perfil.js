// ═══════════════════════════════════════════════
//  perfil.js — MegaMind
//  Gerencia: perfil, modo escuro, metas
// ═══════════════════════════════════════════════

const KEYS = {
  avatar: 'megamind_avatar',
  name:   'megamind_nome',
  handle: 'megamind_handle',
  dark:   'megamind_dark',
  metas:  'megamind_metas',
};

// ───────────────────────────────────────────────
// UTILITÁRIOS
// ───────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('mm-toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

function salvar(key, val) {
  try { localStorage.setItem(key, typeof val === 'object' ? JSON.stringify(val) : val); } catch {}
}

function carregar(key) {
  return localStorage.getItem(key);
}

// ───────────────────────────────────────────────
// MODO ESCURO — aplica em TODAS as páginas
// ───────────────────────────────────────────────
function aplicarModoEscuro(ativo) {
  document.documentElement.classList.toggle('dark-mode', ativo);
  // Sincroniza toggles visíveis na página
  document.querySelectorAll('.toggle-dark').forEach(el => {
    el.classList.toggle('ativo', ativo);
  });
}

function inicializarModoEscuro() {
  const ativo = carregar(KEYS.dark) === 'true';
  aplicarModoEscuro(ativo);

  document.querySelectorAll('.toggle-dark').forEach(el => {
    el.addEventListener('click', () => {
      const novoEstado = !document.documentElement.classList.contains('dark-mode');
      salvar(KEYS.dark, novoEstado);
      aplicarModoEscuro(novoEstado);
    });
  });
}

// ───────────────────────────────────────────────
// PERFIL — carrega dados em todas as páginas
// ───────────────────────────────────────────────
function carregarPerfil() {
  const avatar  = carregar(KEYS.avatar);
  const nome    = carregar(KEYS.name);
  const handle  = carregar(KEYS.handle);

  document.querySelectorAll('#avatar-img, .mm-avatar-img').forEach(img => {
    if (avatar) img.src = avatar;
  });
  document.querySelectorAll('.js-student-name').forEach(el => {
    if (nome) el.textContent = nome;
  });
  document.querySelectorAll('.js-student-handle').forEach(el => {
    if (handle) el.textContent = '@' + handle;
  });
}

// ───────────────────────────────────────────────
// MODAL — EDITAR PERFIL
// ───────────────────────────────────────────────
function inicializarModalPerfil() {
  const btn = document.getElementById('edit-profile-btn');
  if (!btn) return;

  const modal = document.createElement('div');
  modal.id = 'mm-modal-perfil';
  modal.innerHTML = `
    <div class="mm-backdrop"></div>
    <div class="mm-box" role="dialog" aria-modal="true" aria-labelledby="mm-modal-title">
      <button class="mm-close" id="mm-close-perfil" aria-label="Fechar">&#x2715;</button>
      <h2 id="mm-modal-title">Editar Perfil</h2>

      <div class="mm-avatar-wrap">
        <div class="mm-avatar-circle" id="mm-avatar-trigger" title="Clique para trocar a foto">
          <img id="mm-avatar-preview" src="img/logo.png" alt="Prévia">
          <div class="mm-avatar-overlay">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            <span>Trocar foto</span>
          </div>
        </div>
        <input type="file" id="mm-file-input" accept="image/*">
      </div>

      <div class="mm-field">
        <label for="mm-input-name">Nome</label>
        <input type="text" id="mm-input-name" maxlength="40" placeholder="Seu nome completo">
      </div>

      <div class="mm-field">
        <label for="mm-input-handle">Nickname</label>
        <div class="mm-handle-wrap">
          <span class="mm-at">@</span>
          <input type="text" id="mm-input-handle" maxlength="20" placeholder="seunickname">
        </div>
      </div>

      <div class="mm-actions">
        <button class="mm-btn-cancel" id="mm-cancel-perfil">Cancelar</button>
        <button class="mm-btn-save"   id="mm-save-perfil">Salvar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const backdrop = modal.querySelector('.mm-backdrop');
  const preview  = modal.querySelector('#mm-avatar-preview');
  const fileInp  = modal.querySelector('#mm-file-input');
  const trigger  = modal.querySelector('#mm-avatar-trigger');
  const nameInp  = modal.querySelector('#mm-input-name');
  const handleInp= modal.querySelector('#mm-input-handle');
  let tempAvatar = null;

  function openModal() {
    const av = carregar(KEYS.avatar);
    if (av) preview.src = av;
    nameInp.value   = carregar(KEYS.name)   || '';
    handleInp.value = carregar(KEYS.handle) || '';
    tempAvatar = null;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    nameInp.focus();
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', openModal);
  modal.querySelector('#mm-close-perfil').addEventListener('click', closeModal);
  modal.querySelector('#mm-cancel-perfil').addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);

  trigger.addEventListener('click', () => fileInp.click());
  fileInp.addEventListener('change', function() {
    const file = this.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => { tempAvatar = e.target.result; preview.src = tempAvatar; };
    reader.readAsDataURL(file);
    this.value = '';
  });

  modal.querySelector('#mm-save-perfil').addEventListener('click', () => {
    const n = nameInp.value.trim();
    const h = handleInp.value.trim().replace(/^@/, '');
    if (n) salvar(KEYS.name, n);
    if (h) salvar(KEYS.handle, h);
    if (tempAvatar) salvar(KEYS.avatar, tempAvatar);
    carregarPerfil();
    closeModal();
    showToast('✅ Perfil atualizado!');
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
}

// ───────────────────────────────────────────────
// MODAL — METAS DIÁRIAS
// ───────────────────────────────────────────────
function inicializarModalMetas() {
  const btn = document.getElementById('btn-metas');
  if (!btn) return;

  // Carrega metas salvas
  function getMetas() {
    try { return JSON.parse(carregar(KEYS.metas)) || {}; } catch { return {}; }
  }

  const modal = document.createElement('div');
  modal.id = 'mm-modal-metas';
  modal.innerHTML = `
    <div class="mm-backdrop"></div>
    <div class="mm-box mm-box-metas" role="dialog" aria-modal="true" aria-labelledby="mm-metas-title">
      <button class="mm-close" id="mm-close-metas" aria-label="Fechar">&#x2715;</button>
      <h2 id="mm-metas-title">🎯 Metas de Estudo</h2>
      <p class="mm-metas-sub">Defina quantas questões quer resolver por período</p>

      <div class="mm-metas-grid">
        <div class="mm-meta-card">
          <div class="mm-meta-icon">📅</div>
          <label for="mm-meta-diaria">Meta Diária</label>
          <div class="mm-meta-input-wrap">
            <button class="mm-meta-dec" data-target="mm-meta-diaria">−</button>
            <input type="number" id="mm-meta-diaria" min="1" max="999" value="30">
            <button class="mm-meta-inc" data-target="mm-meta-diaria">+</button>
          </div>
          <span class="mm-meta-label">questões / dia</span>
        </div>

        <div class="mm-meta-card">
          <div class="mm-meta-icon">📆</div>
          <label for="mm-meta-semanal">Meta Semanal</label>
          <div class="mm-meta-input-wrap">
            <button class="mm-meta-dec" data-target="mm-meta-semanal">−</button>
            <input type="number" id="mm-meta-semanal" min="1" max="9999" value="150">
            <button class="mm-meta-inc" data-target="mm-meta-semanal">+</button>
          </div>
          <span class="mm-meta-label">questões / semana</span>
        </div>

        <div class="mm-meta-card">
          <div class="mm-meta-icon">🗓️</div>
          <label for="mm-meta-mensal">Meta Mensal</label>
          <div class="mm-meta-input-wrap">
            <button class="mm-meta-dec" data-target="mm-meta-mensal">−</button>
            <input type="number" id="mm-meta-mensal" min="1" max="9999" value="500">
            <button class="mm-meta-inc" data-target="mm-meta-mensal">+</button>
          </div>
          <span class="mm-meta-label">questões / mês</span>
        </div>
      </div>

      <div class="mm-actions">
        <button class="mm-btn-cancel" id="mm-cancel-metas">Cancelar</button>
        <button class="mm-btn-save"   id="mm-save-metas">Salvar metas</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const backdrop = modal.querySelector('.mm-backdrop');

  function openMetas() {
    const m = getMetas();
    modal.querySelector('#mm-meta-diaria').value  = m.diaria  || 30;
    modal.querySelector('#mm-meta-semanal').value = m.semanal || 150;
    modal.querySelector('#mm-meta-mensal').value  = m.mensal  || 500;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMetas() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', openMetas);
  modal.querySelector('#mm-close-metas').addEventListener('click', closeMetas);
  modal.querySelector('#mm-cancel-metas').addEventListener('click', closeMetas);
  backdrop.addEventListener('click', closeMetas);

  // Botões + e −
  modal.querySelectorAll('.mm-meta-dec, .mm-meta-inc').forEach(b => {
    b.addEventListener('click', () => {
      const inp = modal.querySelector('#' + b.dataset.target);
      const step = b.classList.contains('mm-meta-inc') ? 1 : -1;
      inp.value = Math.max(Number(inp.min), Number(inp.value) + step);
    });
  });

  modal.querySelector('#mm-save-metas').addEventListener('click', () => {
    const metas = {
      diaria:  Number(modal.querySelector('#mm-meta-diaria').value),
      semanal: Number(modal.querySelector('#mm-meta-semanal').value),
      mensal:  Number(modal.querySelector('#mm-meta-mensal').value),
    };
    salvar(KEYS.metas, metas);
    // Atualiza o texto visível na linha de meta diária
    document.querySelectorAll('.js-meta-valor').forEach(el => {
      el.textContent = metas.diaria + ' questões';
    });
    closeMetas();
    showToast('✅ Metas salvas!');
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeMetas();
  });

  // Carrega valor salvo no texto da linha
  const m = getMetas();
  if (m.diaria) {
    document.querySelectorAll('.js-meta-valor').forEach(el => {
      el.textContent = m.diaria + ' questões';
    });
  }
}

// ───────────────────────────────────────────────
// INIT
// ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  inicializarModoEscuro();
  carregarPerfil();
  inicializarModalPerfil();
  inicializarModalMetas();
});
