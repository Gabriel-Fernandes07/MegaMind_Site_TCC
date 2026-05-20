function mostrarMensagem(event) {
    event.preventDefault();

    const botao = document.getElementById("btnEnviar");
    const textoBotao = document.getElementById("textoBotao");
    const mensagem = document.getElementById("mensagem");

    botao.disabled = true;
    textoBotao.textContent = "Enviando...";

    setTimeout(() => {
        mensagem.textContent = "Código enviado para seu e-mail!";
        mensagem.style.color = "lightgreen";

        event.target.submit();
    }, 2000);
}