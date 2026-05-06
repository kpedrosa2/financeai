import {
  createCategory,
  createEntityRecord,
  createTransaction,
  deleteCategory,
  deleteEntityRecord,
  deleteTransaction,
  getTransactionSuggestions as fetchTransactionSuggestions,
  listCategories,
  listEntityRecords,
  listTransactions,
  updateCategory,
  updateEntityRecord,
  updateTransaction,
} from "../services/domain-service.js";
import { categorySchema, transactionSchema } from "../validators/domain-validators.js";

function ctx(req) {
  return { userId: req.user.id, organizationId: req.user.organizationId };
}

export async function getCategories(req, res, next) {
  try {
    res.json(await listCategories(ctx(req)));
  } catch (error) {
    next(error);
  }
}

export async function postCategory(req, res, next) {
  try {
    const payload = categorySchema.parse(req.body);
    res.status(201).json(await createCategory(ctx(req), payload));
  } catch (error) {
    next(error);
  }
}

export async function patchCategory(req, res, next) {
  try {
    res.json(await updateCategory(ctx(req), req.params.id, req.body));
  } catch (error) {
    next(error);
  }
}

export async function removeCategory(req, res, next) {
  try {
    res.json(await deleteCategory(ctx(req), req.params.id));
  } catch (error) {
    next(error);
  }
}

export async function getTransactionSuggestions(req, res, next) {
  try {
    res.json(await fetchTransactionSuggestions(ctx(req), req.query.q));
  } catch (error) {
    next(error);
  }
}

export async function getTransactions(req, res, next) {
  try {
    res.json(await listTransactions(ctx(req)));
  } catch (error) {
    next(error);
  }
}

export async function postTransaction(req, res, next) {
  try {
    const payload = transactionSchema.parse(req.body);
    res.status(201).json(await createTransaction(ctx(req), payload));
  } catch (error) {
    next(error);
  }
}

export async function patchTransaction(req, res, next) {
  try {
    res.json(await updateTransaction(ctx(req), req.params.id, req.body));
  } catch (error) {
    next(error);
  }
}

export async function removeTransaction(req, res, next) {
  try {
    res.json(await deleteTransaction(ctx(req), req.params.id));
  } catch (error) {
    next(error);
  }
}

export async function getEntityRecords(req, res, next) {
  try {
    res.json(await listEntityRecords(ctx(req), req.params.entity, req.query));
  } catch (error) {
    next(error);
  }
}

export async function postEntityRecord(req, res, next) {
  try {
    res.status(201).json(await createEntityRecord(ctx(req), req.params.entity, req.body));
  } catch (error) {
    next(error);
  }
}

export async function patchEntityRecord(req, res, next) {
  try {
    res.json(await updateEntityRecord(ctx(req), req.params.entity, req.params.id, req.body));
  } catch (error) {
    next(error);
  }
}

export async function removeEntityRecord(req, res, next) {
  try {
    res.json(await deleteEntityRecord(ctx(req), req.params.entity, req.params.id));
  } catch (error) {
    next(error);
  }
}
