import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "megamindapp-4e60c.firebaseapp.com",
  projectId: "megamindapp-4e60c",
  storageBucket: "megamindapp-4e60c.appspot.com",
  messagingSenderId: "114881660257",
  appId: "1:114881660257:web:d0b6ae935486429bfb3120"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

//
// CADASTRO
//
window.cadastrar = async function () {
  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  if (!nome || !email || !senha) {
    alert("Preencha todos os campos.");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      senha
    );

    // Salva nome no Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      nome: nome,
      email: email
    });

    alert("Cadastro realizado com sucesso!");
    window.location.href = "index.html";
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      alert("E-mail já cadastrado.");
    } else if (error.code === "auth/invalid-email") {
      alert("E-mail inválido.");
    } else if (error.code === "auth/weak-password") {
      alert("Senha fraca (mínimo 6 caracteres).");
    } else {
      alert("Erro: " + error.message);
    }
  }
};

//
// LOGIN
//
window.login = async function () {
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  if (!email || !senha) {
    alert("Preencha e-mail e senha.");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, senha);
    window.location.href = "home.html";
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      alert("Usuário não encontrado.");
    } else if (error.code === "auth/wrong-password") {
      alert("Senha incorreta.");
    } else if (error.code === "auth/invalid-email") {
      alert("E-mail inválido.");
    } else {
      alert("Erro: " + error.message);
    }
  }
};

//
// RECUPERAR SENHA
//
window.recuperarSenha = async function () {
  const email = document.getElementById("email").value.trim();

  if (!email) {
    alert("Digite seu e-mail.");
    return;
  }

  try {
    const actionCodeSettings = {
      url: "https://megamindapp-4e60c.web.app/resetar-senha.html",
      handleCodeInApp: false
    };

    await sendPasswordResetEmail(auth, email, actionCodeSettings);

    alert("Se o e-mail existir, o link de recuperação foi enviado.");
    window.location.href = "index.html";
  } catch (error) {
    if (error.code === "auth/invalid-email") {
      alert("E-mail inválido.");
    } else {
      alert("Erro: " + error.message);
    }
  }
};

//
// HOME.HTML - EXIBIR NOME DO USUÁRIO
//
const paginaAtual = window.location.pathname;

if (paginaAtual.includes("home")) {
  onAuthStateChanged(auth, async (user) => {
    // Se não estiver logado, volta para login
    if (!user) {
      window.location.href = "index.html";
      return;
    }

    const bemVindo = document.getElementById("bemvindo");

    if (!bemVindo) return;

    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const dados = docSnap.data();

        // Mostra o nome salvo no Firestore
        bemVindo.textContent = dados.nome || "Aluno";
      } else {
        // Se não encontrar documento
        bemVindo.textContent = user.email.split("@")[0];
      }
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
      bemVindo.textContent = "Aluno";
    }
  });
}