// ===============================
// LOGIN / CADASTRO
// ===============================

const wrapper = document.querySelector(".wrapper");
const loginLink = document.querySelector(".login-link");
const registerLink = document.querySelector(".register-link");
const btnPopup = document.querySelector(".btnLogin-popup");
const iconClose = document.querySelector(".icon-close");

registerLink.addEventListener("click", (e) => {
    e.preventDefault();
    wrapper.classList.add("active");
});

loginLink.addEventListener("click", (e) => {
    e.preventDefault();
    wrapper.classList.remove("active");
});

btnPopup.addEventListener("click", () => {
    wrapper.classList.add("active-popup");
});

iconClose.addEventListener("click", () => {
    wrapper.classList.remove("active-popup");
});


// ===============================
// NAVEGAÇÃO DAS PÁGINAS
// ===============================

const pages = document.querySelectorAll(".page");
const navLinks = document.querySelectorAll(".navigation a[data-page]");

function showPage(pageName) {
    pages.forEach(page => {
        page.classList.remove("active");
    });

    document
        .querySelector("." + pageName)
        .classList.add("active");

    // Marca o link do menu correspondente
    navLinks.forEach(link => {
        link.classList.toggle(
            "active-link",
            link.getAttribute("data-page") === pageName
        );
    });
}

// Página inicial
showPage("home");

// ===============================
// INTEGRAÇÃO COM A API
// ===============================

const API_URL = "/api";

// CADASTRO
document.querySelector(".form-box.register form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const inputs = e.target.querySelectorAll("input");
    const username = inputs[0].value;
    const email = inputs[1].value;
    const password = inputs[2].value;

    const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ username, email, password })
    });

    const data = await res.json();

    if (!res.ok) {
        alert(data.error);
        return;
    }

    alert("Conta criada com sucesso!");
    wrapper.classList.remove("active");
});

// LOGIN
document.querySelector(".form-box.login form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const inputs = e.target.querySelectorAll("input");
    const email = inputs[0].value;
    const password = inputs[1].value;

    const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
        alert(data.error);
        return;
    }

    wrapper.classList.remove("active-popup"); // fecha com a mesma animação da abertura
    checkAdminAccess(); // já atualiza o menu/comentários se for admin
});
// ENVIO DE COMENTÁRIO
document.querySelector(".comment-box form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = e.target.querySelector('input[type="text"]').value;
    const content = e.target.querySelector("textarea").value;

    const res = await fetch(`${API_URL}/comments`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ name, content })
    });

    const data = await res.json();

    if (!res.ok) {
        alert(data.error);
        return;
    }

    alert("Comentário enviado com sucesso!");
    e.target.reset();
});

async function checkAdminAccess() {
    const section = document.querySelector(".admin-comments-section");
    const contactLink = document.querySelector('.navigation a[data-page="contact"]');
    const logoutBtn = document.querySelector(".btn-logout");

    try {
        const meRes = await fetch("/api/auth/me", {
            credentials: "include",
        });

        if (!meRes.ok) {
            section.style.display = "none";
            contactLink.style.display = "none";
            logoutBtn.style.display = "none";
            return;
        }

        const { user } = await meRes.json();

        if (user.role !== "admin") {
            section.style.display = "none";
            contactLink.style.display = "none";
            logoutBtn.style.display = "none";
            return;
        }

        contactLink.style.display = "inline-block";
        logoutBtn.style.display = "inline-block";

        const res = await fetch("/api/comments", {
            credentials: "include",
        });
        const { comments } = await res.json();

        section.style.display = "block";
        renderComments(comments);
    } catch (err) {
        console.error(err);
        section.style.display = "none";
        contactLink.style.display = "none";
        logoutBtn.style.display = "none";
    }
}

// Roda assim que a página carrega
checkAdminAccess();

// Roda de novo toda vez que a página "contact" é aberta pelo menu,
// pra sempre trazer os comentários mais recentes
navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const pageName = link.getAttribute("data-page");
        showPage(pageName);

        if (pageName === "contact") {
            checkAdminAccess();
        }
    });
});

// LOGOUT
document.querySelector(".btn-logout").addEventListener("click", async () => {
    await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
    });

    showPage("home");
    checkAdminAccess(); // vai esconder Contact e a seção de comentários de novo
});

function renderComments(comments) {
    const container = document.querySelector(".admin-comments");

    if (comments.length === 0) {
        container.innerHTML = "<p style='color:white;'>Nenhum comentário ainda.</p>";
        return;
    }

    container.innerHTML = comments
        .map((c) => {
            const date = new Date(c.created_at).toLocaleString("pt-BR");
            return `
                <div class="contact-card">
                    <h2>👤 ${c.name}</h2>
                    <p>${c.content}</p>
                    <span class="comment-date">${date}</span>
                    <button class="btn-delete-comment" data-id="${c.id}">🗑 Excluir</button>
                </div>
            `;
        })
        .join("");

    // Liga o evento de clique em cada botão de excluir gerado
    document.querySelectorAll(".btn-delete-comment").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.getAttribute("data-id");

            const res = await fetch(`/api/comments/${id}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (res.ok) {
                checkAdminAccess(); // recarrega a lista sem esse comentário
            }
        });
    });
}