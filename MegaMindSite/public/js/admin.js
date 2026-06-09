import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  arrayUnion,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAXoLRatnIuZSEXYENjFGWgloV3-xaDf9Q",
  authDomain: "megamindapp-4e60c.firebaseapp.com",
  projectId: "megamindapp-4e60c",
  storageBucket: "megamindapp-4e60c.firebasestorage.app",
  messagingSenderId: "114881660257",
  appId: "1:114881660257:web:d0b6ae935486429bfb3120"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const subjectMap = {
  matematica: "questoes_matematica",
  portugues: "questoes_portugues",
  redacao: "questoes_redacao"
};

let currentSubjectCollection = "questoes_matematica";
let currentQuestionsDocs = [];
let currentQuestionSetData = null;
let currentQuestionItems = [];

function formatTimestamp(value) {
  if (!value) return "-";
  return value.toDate ? value.toDate().toLocaleString("pt-BR") : value;
}

function safeText(value) {
  return value || "-";
}

function activateTab(targetId) {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
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
    content.classList.toggle('ativo', content.id === targetId);
  });
}

async function loadUsers() {
  const usersBody = document.getElementById('corpo-usuarios');
  usersBody.innerHTML = '<tr class="sem-dados"><td colspan="5">Carregando usuários...</td></tr>';

  try {
    const snapshot = await getDocs(collection(db, 'usuarios'));

    if (snapshot.empty) {
      usersBody.innerHTML = '<tr class="sem-dados"><td colspan="5">Nenhum usuário cadastrado</td></tr>';
      return;
    }

    usersBody.innerHTML = '';
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${safeText(data.nome)}</td>
        <td>${safeText(data.email)}</td>
        <td>${safeText(data.status || 'ativo')}</td>
        <td>${formatTimestamp(data.createdAt)}</td>
        <td>
          <button class="btn-secundario" type="button" onclick="editarUsuario('${docSnap.id}')">Editar</button>
          <button class="btn-danger" type="button" onclick="excluirUsuario('${docSnap.id}')">Excluir</button>
        </td>
      `;
      usersBody.appendChild(row);
    });
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
    usersBody.innerHTML = '<tr class="sem-dados"><td colspan="5">Erro ao carregar usuários</td></tr>';
  }
}

async function editarUsuario(id) {
  try {
    const userRef = doc(db, 'usuarios', id);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      alert('Usuário não encontrado.');
      return;
    }

    const data = userSnap.data();
    abrirFormularioUsuario({ id: userSnap.id, ...data });
  } catch (error) {
    console.error('Erro ao editar usuário:', error);
    alert('Não foi possível carregar o usuário para edição.');
  }
}

async function excluirUsuario(id) {
  const confirmDelete = confirm('Deseja realmente excluir este usuário do banco de dados?');
  if (!confirmDelete) return;

  try {
    await deleteDoc(doc(db, 'usuarios', id));
    await loadUsers();
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    alert('Não foi possível excluir o usuário.');
  }
}

function abrirFormularioUsuario(userData = null) {
  const form = document.getElementById('form-usuario');
  const usuarioId = document.getElementById('usuario-id');
  const usuarioNome = document.getElementById('usuario-nome');
  const usuarioEmail = document.getElementById('usuario-email');
  const usuarioStatus = document.getElementById('usuario-status');

  if (userData) {
    usuarioId.value = userData.id;
    usuarioNome.value = userData.nome || '';
    usuarioEmail.value = userData.email || '';
    usuarioStatus.value = userData.status || 'ativo';
  } else {
    usuarioId.value = '';
    usuarioNome.value = '';
    usuarioEmail.value = '';
    usuarioStatus.value = 'ativo';
  }

  form.style.display = 'block';
}

function fecharFormularioUsuario() {
  document.getElementById('form-usuario').style.display = 'none';
}

async function salvarUsuario() {
  const usuarioId = document.getElementById('usuario-id').value;
  const usuarioNome = document.getElementById('usuario-nome').value.trim();
  const usuarioStatus = document.getElementById('usuario-status').value;

  if (!usuarioId) {
    alert('Selecione um usuário para salvar.');
    return;
  }

  if (!usuarioNome) {
    alert('Informe o nome do usuário.');
    return;
  }

  try {
    await updateDoc(doc(db, 'usuarios', usuarioId), {
      nome: usuarioNome,
      status: usuarioStatus,
      updatedAt: serverTimestamp()
    });
    fecharFormularioUsuario();
    await loadUsers();
  } catch (error) {
    console.error('Erro ao salvar usuário:', error);
    alert('Não foi possível salvar o usuário.');
  }
}

function abrirFormularioConteudo(edit = false, docData = null) {
  const form = document.getElementById('form-conteudo');
  const conteudoId = document.getElementById('conteudo-id');
  const titulo = document.getElementById('titulo-conteudo');
  const tipo = document.getElementById('tipo-conteudo');
  const status = document.getElementById('status-conteudo');
  const descricao = document.getElementById('descricao-conteudo');

  if (edit && docData) {
    conteudoId.value = docData.id;
    titulo.value = docData.titulo || '';
    tipo.value = docData.tipo || 'matematica';
    status.value = docData.status || 'ativo';
    descricao.value = docData.descricao || '';
  } else {
    conteudoId.value = '';
    titulo.value = '';
    tipo.value = 'matematica';
    status.value = 'ativo';
    descricao.value = '';
  }

  form.style.display = 'block';
}

function fecharFormularioConteudo() {
  document.getElementById('form-conteudo').style.display = 'none';
}

async function salvarConteudo() {
  const conteudoId = document.getElementById('conteudo-id').value;
  const titulo = document.getElementById('titulo-conteudo').value.trim();
  const tipo = document.getElementById('tipo-conteudo').value;
  const status = document.getElementById('status-conteudo').value;
  const descricao = document.getElementById('descricao-conteudo').value.trim();

  if (!titulo) {
    alert('Informe o título do conteúdo.');
    return;
  }

  try {
    const payload = {
      titulo,
      tipo,
      status,
      descricao,
      updatedAt: serverTimestamp()
    };

    if (conteudoId) {
      await updateDoc(doc(db, 'conteudos', conteudoId), payload);
    } else {
      await addDoc(collection(db, 'conteudos'), {
        ...payload,
        createdAt: serverTimestamp()
      });
    }

    fecharFormularioConteudo();
    loadConteudos();
  } catch (error) {
    console.error('Erro ao salvar conteúdo:', error);
    alert('Não foi possível salvar o conteúdo.');
  }
}

async function loadConteudos() {
  const body = document.getElementById('corpo-conteudo');
  body.innerHTML = '<tr class="sem-dados"><td colspan="5">Carregando conteúdos...</td></tr>';

  try {
    const snapshot = await getDocs(collection(db, 'conteudos'));
    if (snapshot.empty) {
      body.innerHTML = '<tr class="sem-dados"><td colspan="5">Nenhum conteúdo cadastrado</td></tr>';
      return;
    }

    body.innerHTML = '';
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${safeText(data.titulo)}</td>
        <td>${safeText(data.tipo)}</td>
        <td>${safeText(data.status)}</td>
        <td>${formatTimestamp(data.createdAt)}</td>
        <td>
          <button class="btn-secundario" type="button" onclick="editarConteudo('${docSnap.id}')">Editar</button>
          <button class="btn-danger" type="button" onclick="excluirConteudo('${docSnap.id}')">Excluir</button>
        </td>
      `;
      body.appendChild(row);
    });
  } catch (error) {
    console.error('Erro ao carregar conteúdos:', error);
    body.innerHTML = '<tr class="sem-dados"><td colspan="5">Erro ao carregar conteúdos</td></tr>';
  }
}

async function editarConteudo(id) {
  try {
    const docRef = doc(db, 'conteudos', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      alert('Conteúdo não encontrado.');
      return;
    }
    abrirFormularioConteudo(true, { id: docSnap.id, ...docSnap.data() });
  } catch (error) {
    console.error('Erro ao editar conteúdo:', error);
    alert('Não foi possível carregar o conteúdo para edição.');
  }
}

async function excluirConteudo(id) {
  const confirmDelete = confirm('Deseja mesmo excluir este conteúdo?');
  if (!confirmDelete) return;

  try {
    await deleteDoc(doc(db, 'conteudos', id));
    loadConteudos();
  } catch (error) {
    console.error('Erro ao excluir conteúdo:', error);
    alert('Não foi possível excluir o conteúdo.');
  }
}

function abrirFormularioQuestaoSeto(edit = false, setData = null) {
  const form = document.getElementById('form-conjunto-questoes');
  const setId = document.getElementById('questoes-set-id');
  const titulo = document.getElementById('titulo-set');
  const status = document.getElementById('status-set');

  if (edit && setData) {
    setId.value = setData.id;
    titulo.value = setData.titulo || '';
    status.value = setData.status || 'ativo';
  } else {
    setId.value = '';
    titulo.value = '';
    status.value = 'ativo';
  }

  form.style.display = 'block';
}

function fecharFormularioQuestaoSeto() {
  document.getElementById('form-conjunto-questoes').style.display = 'none';
}

function abrirFormularioQuestaoItem() {
  const form = document.getElementById('form-questao-item');
  if (currentQuestionsDocs.length === 0) {
    alert('Adicione um conjunto de questões antes de criar questões individuais.');
    return;
  }

  document.getElementById('questao-item-index').value = '';
  document.getElementById('enunciado-questao').value = '';
  document.getElementById('alternativa-a').value = '';
  document.getElementById('alternativa-b').value = '';
  document.getElementById('alternativa-c').value = '';
  document.getElementById('alternativa-d').value = '';
  document.getElementById('alternativa-e').value = '';
  document.getElementById('resposta-correta').value = 'A';
  atualizarSelectConjuntoQuestoes();
  carregarQuestoesDoSet();
  form.style.display = 'block';
}

function fecharFormularioQuestaoItem() {
  document.getElementById('form-questao-item').style.display = 'none';
}

function preencherFormularioQuestaoItem(setId, index) {
  const questao = currentQuestionItems[index];
  if (!questao) return;

  document.getElementById('questao-item-index').value = index;
  document.getElementById('select-set-questao-documento').value = setId;
  document.getElementById('enunciado-questao').value = questao.enunciado || '';
  document.getElementById('alternativa-a').value = questao.alternativa_a || '';
  document.getElementById('alternativa-b').value = questao.alternativa_b || '';
  document.getElementById('alternativa-c').value = questao.alternativa_c || '';
  document.getElementById('alternativa-d').value = questao.alternativa_d || '';
  document.getElementById('alternativa-e').value = questao.alternativa_e || '';
  document.getElementById('resposta-correta').value = questao.resposta_correta || 'A';
  document.getElementById('form-questao-item').style.display = 'block';
}

async function carregarQuestoesDoSet() {
  const setId = document.getElementById('select-set-questao-documento').value;
  const detalhe = document.getElementById('detalhe-questoes-set');
  const texto = document.getElementById('texto-conjunto-questoes');
  const corpo = document.getElementById('corpo-questao-detalhe');

  if (!setId) {
    texto.textContent = 'Nenhum conjunto selecionado';
    corpo.innerHTML = '<tr class="sem-dados"><td colspan="4">Selecione um conjunto para ver as questões</td></tr>';
    detalhe.style.display = 'block';
    return;
  }

  const conjunto = currentQuestionsDocs.find((item) => item.id === setId);
  if (!conjunto) {
    texto.textContent = 'Conjunto não encontrado.';
    corpo.innerHTML = '<tr class="sem-dados"><td colspan="4">Conjunto não encontrado</td></tr>';
    detalhe.style.display = 'block';
    return;
  }

  currentQuestionSetData = conjunto;
  currentQuestionItems = Array.isArray(conjunto.questoes) ? [...conjunto.questoes] : [];
  texto.textContent = `Conjunto: ${conjunto.titulo || conjunto.id} — ${currentQuestionItems.length} questão(ões)`;
  detalhe.style.display = 'block';

  if (currentQuestionItems.length === 0) {
    corpo.innerHTML = '<tr class="sem-dados"><td colspan="4">Ainda não há questões neste conjunto</td></tr>';
    return;
  }

  corpo.innerHTML = '';
  currentQuestionItems.forEach((questao, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${safeText(questao.enunciado)}</td>
      <td>${safeText(questao.resposta_correta)}</td>
      <td>
        <button class="btn-secundario" type="button" onclick="editarQuestaoItem(${index})">Editar</button>
        <button class="btn-danger" type="button" onclick="excluirQuestaoItem(${index})">Excluir</button>
      </td>
    `;
    corpo.appendChild(row);
  });
}

async function editarQuestaoItem(index) {
  const setId = document.getElementById('select-set-questao-documento').value;
  if (!setId) {
    alert('Selecione um conjunto antes de editar questões.');
    return;
  }

  atualizarSelectConjuntoQuestoes();
  preencherFormularioQuestaoItem(setId, index);
}

async function excluirQuestaoItem(index) {
  const setId = document.getElementById('select-set-questao-documento').value;
  if (!setId) {
    alert('Selecione um conjunto antes de excluir questões.');
    return;
  }

  const confirmDelete = confirm('Deseja realmente excluir esta questão do conjunto?');
  if (!confirmDelete) return;

  const item = currentQuestionItems[index];
  if (!item) return;

  try {
    currentQuestionItems.splice(index, 1);
    await updateDoc(doc(db, currentSubjectCollection, setId), {
      questoes: currentQuestionItems,
      updatedAt: serverTimestamp()
    });
    await carregarQuestoesDoSet();
    loadQuestoes();
  } catch (error) {
    console.error('Erro ao excluir questão:', error);
    alert('Não foi possível excluir a questão.');
  }
}

async function salvarQuestaoItem() {
  const setId = document.getElementById('select-set-questao-documento').value;
  const index = document.getElementById('questao-item-index').value;
  const enunciado = document.getElementById('enunciado-questao').value.trim();
  const alternativaA = document.getElementById('alternativa-a').value.trim();
  const alternativaB = document.getElementById('alternativa-b').value.trim();
  const alternativaC = document.getElementById('alternativa-c').value.trim();
  const alternativaD = document.getElementById('alternativa-d').value.trim();
  const alternativaE = document.getElementById('alternativa-e').value.trim();
  const respostaCorreta = document.getElementById('resposta-correta').value;

  if (!setId) {
    alert('Selecione um conjunto de questões.');
    return;
  }

  if (!enunciado || !alternativaA || !alternativaB || !alternativaC || !alternativaD || !alternativaE) {
    alert('Preencha todos os campos da questão.');
    return;
  }

  const novaQuestao = {
    enunciado,
    alternativa_a: alternativaA,
    alternativa_b: alternativaB,
    alternativa_c: alternativaC,
    alternativa_d: alternativaD,
    alternativa_e: alternativaE,
    resposta_correta: respostaCorreta
  };

  try {
    if (index !== '') {
      const itemIndex = Number(index);
      currentQuestionItems[itemIndex] = novaQuestao;
    } else {
      currentQuestionItems.push(novaQuestao);
    }

    await updateDoc(doc(db, currentSubjectCollection, setId), {
      questoes: currentQuestionItems,
      updatedAt: serverTimestamp()
    });

    alert(index !== '' ? 'Questão atualizada com sucesso.' : 'Questão adicionada ao conjunto com sucesso.');
    document.getElementById('form-questao-item').style.display = 'none';
    await carregarQuestoesDoSet();
    await loadQuestoes();
  } catch (error) {
    console.error('Erro ao salvar questão:', error);
    alert('Não foi possível salvar a questão.');
  }
}

async function salvarQuestaoSeto() {
  const setId = document.getElementById('questoes-set-id').value;
  const titulo = document.getElementById('titulo-set').value.trim();
  const status = document.getElementById('status-set').value;

  if (!titulo) {
    alert('Informe o título do conjunto de questões.');
    return;
  }

  try {
    const payload = {
      titulo,
      status,
      updatedAt: serverTimestamp()
    };

    if (setId) {
      await updateDoc(doc(db, currentSubjectCollection, setId), payload);
    } else {
      await addDoc(collection(db, currentSubjectCollection), {
        ...payload,
        questoes: [],
        createdAt: serverTimestamp()
      });
    }

    fecharFormularioQuestaoSeto();
    loadQuestoes();
  } catch (error) {
    console.error('Erro ao salvar conjunto de questões:', error);
    alert('Não foi possível salvar o conjunto de questões.');
  }
}

async function loadQuestoes() {
  const body = document.getElementById('corpo-questoes');
  body.innerHTML = '<tr class="sem-dados"><td colspan="5">Carregando conjuntos...</td></tr>';

  try {
    const snapshot = await getDocs(collection(db, currentSubjectCollection));
    currentQuestionsDocs = [];

    if (snapshot.empty) {
      body.innerHTML = '<tr class="sem-dados"><td colspan="5">Nenhum conjunto de questões encontrado</td></tr>';
      atualizarSelectConjuntoQuestoes();
      return;
    }

    body.innerHTML = '';
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      currentQuestionsDocs.push({ id: docSnap.id, ...data });
      const row = document.createElement('tr');
      const questionsCount = Array.isArray(data.questoes) ? data.questoes.length : 0;

      row.innerHTML = `
        <td>${docSnap.id}</td>
        <td>${safeText(data.titulo)}</td>
        <td>${questionsCount}</td>
        <td>${safeText(data.status)}</td>
        <td>
          <button class="btn-secundario" type="button" onclick="editarConjuntoQuestoes('${docSnap.id}')">Editar</button>
          <button class="btn-danger" type="button" onclick="excluirConjuntoQuestoes('${docSnap.id}')">Excluir</button>
        </td>
      `;
      body.appendChild(row);
    });

    atualizarSelectConjuntoQuestoes();
    carregarQuestoesDoSet();
  } catch (error) {
    console.error('Erro ao carregar conjuntos de questões:', error);
    body.innerHTML = '<tr class="sem-dados"><td colspan="5">Erro ao carregar conjuntos</td></tr>';
  }
}

function atualizarSelectConjuntoQuestoes() {
  const select = document.getElementById('select-set-questao-documento');
  select.innerHTML = '';
  if (currentQuestionsDocs.length === 0) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'Nenhum conjunto disponível';
    select.appendChild(option);
    return;
  }

  currentQuestionsDocs.forEach((item) => {
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = `${item.titulo || item.id} (${item.id})`;
    select.appendChild(option);
  });
}

async function editarConjuntoQuestoes(id) {
  try {
    const docRef = doc(db, currentSubjectCollection, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      alert('Conjunto não encontrado.');
      return;
    }

    abrirFormularioQuestaoSeto(true, { id: docSnap.id, ...docSnap.data() });
  } catch (error) {
    console.error('Erro ao editar conjunto de questões:', error);
    alert('Não foi possível carregar o conjunto para edição.');
  }
}

async function excluirConjuntoQuestoes(id) {
  const confirmDelete = confirm('Deseja realmente excluir este conjunto de questões?');
  if (!confirmDelete) return;

  try {
    await deleteDoc(doc(db, currentSubjectCollection, id));
    loadQuestoes();
  } catch (error) {
    console.error('Erro ao excluir conjunto de questões:', error);
    alert('Não foi possível excluir o conjunto de questões.');
  }
}

async function salvarQuestaoItem() {
  const setId = document.getElementById('select-set-questao-documento').value;
  const enunciado = document.getElementById('enunciado-questao').value.trim();
  const alternativaA = document.getElementById('alternativa-a').value.trim();
  const alternativaB = document.getElementById('alternativa-b').value.trim();
  const alternativaC = document.getElementById('alternativa-c').value.trim();
  const alternativaD = document.getElementById('alternativa-d').value.trim();
  const alternativaE = document.getElementById('alternativa-e').value.trim();
  const respostaCorreta = document.getElementById('resposta-correta').value;

  if (!setId) {
    alert('Selecione um conjunto de questões.');
    return;
  }

  if (!enunciado || !alternativaA || !alternativaB || !alternativaC || !alternativaD || !alternativaE) {
    alert('Preencha todos os campos da questão.');
    return;
  }

  try {
    await updateDoc(doc(db, currentSubjectCollection, setId), {
      questoes: arrayUnion({
        enunciado,
        alternativa_a: alternativaA,
        alternativa_b: alternativaB,
        alternativa_c: alternativaC,
        alternativa_d: alternativaD,
        alternativa_e: alternativaE,
        resposta_correta: respostaCorreta
      })
    });

    alert('Questão adicionada ao conjunto com sucesso.');
    document.getElementById('enunciado-questao').value = '';
    document.getElementById('alternativa-a').value = '';
    document.getElementById('alternativa-b').value = '';
    document.getElementById('alternativa-c').value = '';
    document.getElementById('alternativa-d').value = '';
    document.getElementById('alternativa-e').value = '';
    loadQuestoes();
  } catch (error) {
    console.error('Erro ao salvar questão:', error);
    alert('Não foi possível adicionar a questão.');
  }
}

async function initDashboard() {
  const tabButtons = document.querySelectorAll('.tab-button');
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

  document.getElementById('btn-recarregar-usuarios').addEventListener('click', loadUsers);
  document.getElementById('btn-salvar-usuario').addEventListener('click', salvarUsuario);
  document.getElementById('btn-cancelar-usuario').addEventListener('click', fecharFormularioUsuario);
  document.getElementById('btn-novo-conteudo').addEventListener('click', () => abrirFormularioConteudo(false));
  document.getElementById('btn-salvar-conteudo').addEventListener('click', salvarConteudo);
  document.getElementById('btn-cancelar-conteudo').addEventListener('click', fecharFormularioConteudo);
  document.getElementById('btn-novo-conjunto').addEventListener('click', () => abrirFormularioQuestaoSeto(false));
  document.getElementById('btn-salvar-conjunto').addEventListener('click', salvarQuestaoSeto);
  document.getElementById('btn-cancelar-conjunto').addEventListener('click', fecharFormularioQuestaoSeto);
  document.getElementById('btn-add-questao-item').addEventListener('click', abrirFormularioQuestaoItem);
  document.getElementById('btn-salvar-questao-item').addEventListener('click', salvarQuestaoItem);
  document.getElementById('btn-cancelar-questao-item').addEventListener('click', fecharFormularioQuestaoItem);
  document.getElementById('select-assunto').addEventListener('change', async (event) => {
    currentSubjectCollection = event.target.value;
    await loadQuestoes();
  });
  document.getElementById('select-set-questao-documento').addEventListener('change', carregarQuestoesDoSet);

  try {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.href = 'index.html';
      }
    });
  } catch (error) {
    console.warn('Auth state check failed:', error);
  }

  await loadUsers();
  await loadConteudos();
  await loadQuestoes();
}

window.editarUsuario = editarUsuario;
window.excluirUsuario = excluirUsuario;
window.editarConteudo = editarConteudo;
window.excluirConteudo = excluirConteudo;
window.editarConjuntoQuestoes = editarConjuntoQuestoes;
window.excluirConjuntoQuestoes = excluirConjuntoQuestoes;
window.editarQuestaoItem = editarQuestaoItem;
window.excluirQuestaoItem = excluirQuestaoItem;

window.addEventListener('DOMContentLoaded', initDashboard);
