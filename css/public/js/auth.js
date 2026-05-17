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
  apiKey: "AIzaSyAXoLRatnIuZSEXYENjFGWgloV3-xaDf9Q",
  authDomain: "megamindapp-4e60c.firebaseapp.com",
  projectId: "megamindapp-4e60c",
  storageBucket: "megamindapp-4e60c.appspot.com",
  messagingSenderId: "114881660257",
  appId: "1:114881660257:web:d0b6ae935486429bfb3120"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

window.cadastrar = async function () {

  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  if (!nome || !email || !senha) {
    alert("Preencha todos os campos");
    return;
  }

  try {

    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);

    await setDoc(doc(db, "users", userCredential.user.uid), {
      nome: nome,
      email: email
    });

    alert("Cadastro realizado com sucesso");

    window.location.href = "index.html";

  } catch (error) {

    if (error.code === "auth/email-already-in-use") {

      alert("Email já cadastrado");

    } else if (error.code === "auth/invalid-email") {

      alert("Email inválido");

    } else if (error.code === "auth/weak-password") {

      alert("Senha fraca (mínimo 6 caracteres)");

    } else {

      alert("Erro: " + error.message);

    }
  }
};

window.login = function () {

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  if (!email || !senha) {
    alert("Preencha email e senha");
    return;
  }

  signInWithEmailAndPassword(auth, email, senha)

    .then(() => {

      window.location.href = "home.html";

    })

    .catch((error) => {

      if (error.code === "auth/user-not-found") {

        alert("Usuário não encontrado");

      } else if (error.code === "auth/wrong-password") {

        alert("Senha incorreta");

      } else if (error.code === "auth/invalid-email") {

        alert("Email inválido");

      } else {

        alert("Erro: " + error.message);

      }
    });
};

window.recuperarSenha = async function () {

  const email = document.getElementById("email").value.trim();

  if (!email) {
    alert("Digite o email");
    return;
  }

  try {

    const actionCodeSettings = {
  url: 'https://megamindapp-4e60c.web.app/resetar-senha.html',
  handleCodeInApp: false
};

await sendPasswordResetEmail(auth, email, actionCodeSettings);

    alert("Se o email existir, o link de recuperação foi enviado.");

  } catch (error) {

    if (error.code === "auth/invalid-email") {

      alert("Email inválido");

    } else {

      alert("Erro: " + error.message);

    }
  }
};



// HOME.HTML
if (window.location.pathname.includes("home.html")) {

  onAuthStateChanged(auth, async (user) => {

    if (user) {

      try {

        const docRef = doc(db, "users", user.uid);

        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {

          const data = docSnap.data();

          // BEM-VINDO
          const nome = document.getElementById("bemvindo");

          if (nome) {
            nome.innerText = ` ${data.nome || ""} 👋`;
          }

          // NOME DO ESTUDANTE
          const studentName = document.querySelector(".student-name");

          if (studentName) {
            studentName.innerText = data.nome || "Aluno";
          }

        }

      } catch (e) {

        console.error(e);

      }

    } else {

      window.location.href = "index.html";

    }

  });

}