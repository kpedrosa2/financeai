import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import {
  getCategories,
  getEntityRecords,
  getTransactionSuggestions,
  getTransactions,
  patchCategory,
  patchEntityRecord,
  patchTransaction,
  postCategory,
  postEntityRecord,
  postTransaction,
  removeCategory,
  removeEntityRecord,
  removeTransaction,
} from "../controllers/domain-controller.js";

export const domainRoutes = Router();

domainRoutes.use(requireAuth);

domainRoutes.get("/categories", getCategories);
domainRoutes.post("/categories", postCategory);
domainRoutes.patch("/categories/:id", patchCategory);
domainRoutes.delete("/categories/:id", removeCategory);

domainRoutes.get("/transactions/suggestions", getTransactionSuggestions);
domainRoutes.get("/transactions", getTransactions);
domainRoutes.post("/transactions", postTransaction);
domainRoutes.patch("/transactions/:id", patchTransaction);
domainRoutes.delete("/transactions/:id", removeTransaction);

domainRoutes.get("/entities/:entity", getEntityRecords);
domainRoutes.post("/entities/:entity", postEntityRecord);
domainRoutes.patch("/entities/:entity/:id", patchEntityRecord);
domainRoutes.delete("/entities/:entity/:id", removeEntityRecord);
