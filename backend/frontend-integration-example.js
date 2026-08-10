// ===============================
// EXEMPLO DE INTEGRAÇÃO COM A API
// Adicione esse trecho no seu script.js (ajustando os seletores conforme seu HTML)
// ===============================

const API_URL = "http://localhost:3000/api";

// ---- CADASTRO ----
document.querySelector(".form-box.register form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const inputs = e.target.querySelectorAll("input");
  const username = inputs[0].value;
  const email = inputs[1].value;
  const password = inputs[2].value;

  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error);
    return;
  }

  alert("Conta criada! Agora faça login.");
  wrapper.classList.remove("active"); // volta pro form de login
});

// ---- LOGIN ----
document.querySelector(".form-box.login form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const inputs = e.target.querySelectorAll("input");
  const email = inputs[0].value;
  const password = inputs[1].value;

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error);
    return;
  }

  wrapper.classList.remove("active-popup");
  checkAdminAccess(); // atualiza a página de contato se for admin
});

// ---- ENVIO DE COMENTÁRIO (formulário na página Services) ----
document.querySelector(".comment-box form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = e.target.querySelector('input[type="text"]').value;
  const content = e.target.querySelector("textarea").value;

  const res = await fetch(`${API_URL}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name, content }),
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error);
    return;
  }

  alert("Comentário enviado!");
  e.target.reset();
});

// ---- MOSTRAR COMENTÁRIOS SÓ PRA ADMIN (na página que vai virar "Contato") ----
async function checkAdminAccess() {
  const container = document.querySelector(".admin-comments"); // crie essa div na page contact
  if (!container) return;

  try {
    const meRes = await fetch(`${API_URL}/auth/me`, { credentials: "include" });
    if (!meRes.ok) {
      container.style.display = "none";
      return;
    }

    const { user } = await meRes.json();
    if (user.role !== "admin") {
      container.style.display = "none";
      return;
    }

    const res = await fetch(`${API_URL}/comments`, { credentials: "include" });
    const { comments } = await res.json();

    container.style.display = "block";
    container.innerHTML = comments
      .map(
        (c) => `
          <div class="contact-card">
            <h2>${c.name}</h2>
            <p>${c.content}</p>
          </div>
        `
      )
      .join("");
  } catch {
    container.style.display = "none";
  }
}

// Chama assim que a página carrega, pra já esconder/mostrar conforme o login atual
checkAdminAccess();
