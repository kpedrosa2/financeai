import { buildDashboard } from "../services/dashboardService.js";

export async function getDashboard(req, res, next) {
  try {
    const data = await buildDashboard({
      userId: req.user.id,
      organizationId: req.user.organizationId,
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
}
