function aparecersidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('show');
}

function toggleDescricao(element) {
    const descricao = element.querySelector('.descricao');
    const texto = descricao.dataset.text || descricao.textContent || '';
    element.classList.toggle("show");

    if (element.classList.contains("show")) {
        typewriterEffect(descricao, texto);
    } else {
        descricao.textContent = '';
    }
}

function typewriterEffect(element, text, speed = 40) {
    element.textContent = '';
    let i = 0;
    const timer = setInterval(() => {
        element.textContent += text[i] || '';
        i++;
        if (i >= text.length) clearInterval(timer);
    }, speed);
}