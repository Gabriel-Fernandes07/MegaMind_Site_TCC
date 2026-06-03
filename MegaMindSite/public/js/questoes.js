// FIREBASE
import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs
}
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


// CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyAXoLRatnIuZSEXYENjFGWgloV3-xaDf9Q",
  authDomain: "megamindapp-4e60c.firebaseapp.com",
  projectId: "megamindapp-4e60c",
  storageBucket: "megamindapp-4e60c.firebasestorage.app",
  messagingSenderId: "114881660257",
  appId: "1:114881660257:web:d0b6ae935486429bfb3120"
};


// INICIAR
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);


// CONTAINER
const container =
document.getElementById("containerQuestoes");


// BUSCAR QUESTÕES
async function carregarQuestoes() {

  try {

    const querySnapshot =
    await getDocs(
      collection(db, "questoes_matematica")
    );

    querySnapshot.forEach((doc) => {

      const dados = doc.data();

      // ARRAY DE QUESTÕES
      const questoes = dados.questoes;

      questoes.forEach((q) => {

        const div =
        document.createElement("div");

        div.classList.add("questao");

        div.innerHTML = `

          <h2>${q.enunciado}</h2>

          <button onclick="responder('A', '${q.resposta_correta}')">
            A) ${q.alternativa_a}
          </button>

          <button onclick="responder('B', '${q.resposta_correta}')">
            B) ${q.alternativa_b}
          </button>

          <button onclick="responder('C', '${q.resposta_correta}')">
            C) ${q.alternativa_c}
          </button>

          <button onclick="responder('D', '${q.resposta_correta}')">
            D) ${q.alternativa_d}
          </button>

          <button onclick="responder('E', '${q.resposta_correta}')">
            E) ${q.alternativa_e}
          </button>

        `;

        container.appendChild(div);

      });

    });

  } catch (error) {

    console.error(error);

  }
}


// VERIFICAR RESPOSTA
window.responder = function(
  resposta,
  correta
){

  if(resposta === correta){

    alert("Acertou!");

  }else{

    alert("Errou!");

  }

};


// INICIAR
carregarQuestoes();