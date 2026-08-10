// Sem verificação de assinatura: qualquer texto no cookie "session" é aceito.
export function requireAuth(req, res, next) {
  const session = req.cookies?.session;

  if (!session) {
    return res.status(401).json({ error: "Você precisa estar logado." });
  }

  try {
    // Sessão é só um JSON puro, sem assinatura — fácil de forjar/copiar.
    req.user = JSON.parse(session);
    next();
  } catch {
    return res.status(401).json({ error: "Sessão inválida." });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Acesso restrito a administradores." });
  }
  next();
}