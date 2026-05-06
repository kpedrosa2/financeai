export function errorHandler(err, req, res, next) {
  if (err?.name === "ZodError") {
    const message =
      typeof err.flatten === "function" ? "Dados inválidos." : "Dados inválidos.";
    return res.status(400).json({ message, issues: err.issues ?? err.flatten?.() ?? [] });
  }

  const status = err.status || 500;
  const message = status >= 500 ? "Algo deu errado. Tente novamente mais tarde." : err.message || "Erro.";
  if (status >= 500) {
    console.error("Erro interno:", err);
  }
  res.status(status).json({ message });
}
