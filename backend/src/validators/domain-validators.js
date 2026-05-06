import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1),
  type: z.enum(["income", "expense", "receita", "despesa"]),
});

export const transactionSchema = z.object({
  description: z.string().min(1),
  amount: z.number().positive(),
  type: z.string().min(1),
  date: z.string().or(z.date()),
  categoryId: z.string().optional().nullable(),
  payload: z.any().optional(),
});
