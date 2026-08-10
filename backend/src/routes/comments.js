import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

// POST /api/comments -> qualquer visitante pode enviar (igual ao formulário atual)
router.post("/", async (req, res) => {
  const { name, content } = req.body;

  if (!name || !content) {
    return res.status(400).json({ error: "Preencha nome e comentário." });
  }

  try {
    await pool.query(
      "INSERT INTO comments (name, content) VALUES (?, ?)",
      [name, content]
    );
    res.status(201).json({ message: "Comentário enviado com sucesso." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao salvar comentário." });
  }
});

// GET /api/comments -> só admin pode ver
router.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, content, created_at FROM comments ORDER BY created_at DESC"
    );
    res.json({ comments: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar comentários." });
  }
});
// DELETE /api/comments/:id -> só admin pode deletar
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM comments WHERE id = ?", [id]);
    res.json({ message: "Comentário deletado." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao deletar comentário." });
  }
});

export default router;
