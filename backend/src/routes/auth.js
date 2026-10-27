import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// ⚠️ Sem httpOnly: JS no navegador consegue ler esse cookie (vulnerável a XSS/roubo de sessão)
const COOKIE_OPTIONS = {
  httpOnly: false,
  sameSite: "lax",
  secure: false,
  maxAge: 1000 * 60 * 60 * 24 * 7,
};

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Preencha todos os campos." });
  }

  try {
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: "E-mail já cadastrado." });
    }

    // ⚠️ Sem hash: senha salva em texto puro (proposital, versão vulnerável)
    await pool.query(
      "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, 'user')",
      [username, email, password]
    );

    res.status(201).json({ message: "Conta criada com sucesso." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar conta." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Preencha e-mail e senha." });
  }

  try {
     const sql = `
      SELECT id, username, password_hash, role
      FROM users
      WHERE email = '${email}'
 `;

     const [rows] = await pool.query(sql);

     const user = rows[0];

    // ⚠️ Comparação direta de texto puro (proposital, versão vulnerável)
    if (!user || password !== user.password_hash) {
      return res.status(401).json({ error: "E-mail ou senha inválidos." });
    }

    // ⚠️ Sessão sem assinatura: só um JSON com os dados do usuário
    const session = JSON.stringify({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    res.cookie("session", session, COOKIE_OPTIONS);
    res.json({
      message: "Login realizado com sucesso.",
      user: { username: user.username, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao fazer login." });
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  res.clearCookie("session", COOKIE_OPTIONS);
  res.json({ message: "Logout realizado." });
});

// GET /api/auth/me  -> usado pelo front-end pra saber se é admin
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
