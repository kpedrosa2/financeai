import { analyzeFinancesLocally } from "./aiFinancialAnalysisService.js";

/**
 * Camada de provedor de IA: hoje apenas `local`.
 * Futuro: OpenAI / Ollama (`AI_PROVIDER` no .env).
 */
export async function runFinancialAiAnalysis(ctx) {
  const provider = (process.env.AI_PROVIDER || "local").toLowerCase().trim();

  if (provider === "openai") {
    const err = new Error("Provedor OpenAI ainda não está implementado.");
    err.status = 501;
    throw err;
  }

  if (provider === "ollama") {
    const err = new Error("Provedor Ollama ainda não está implementado.");
    err.status = 501;
    throw err;
  }

  return analyzeFinancesLocally(ctx);
}
