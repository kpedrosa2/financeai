import { runFinancialAiAnalysis } from "../services/aiProviderService.js";

export async function postAnalyze(req, res, next) {
  try {
    const result = await runFinancialAiAnalysis({
      userId: req.user.id,
      organizationId: req.user.organizationId,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}
