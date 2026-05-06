import { buildInsights } from "../services/insightService.js";

export async function getInsights(req, res, next) {
  try {
    const data = await buildInsights({
      userId: req.user.id,
      organizationId: req.user.organizationId,
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
}
