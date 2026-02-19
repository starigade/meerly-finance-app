import { z } from "zod";

// ============================================================
// Account form schema
// ============================================================

export const accountFormSchema = z.object({
  name: z.string().min(1, "Account name is required").max(100),
  sub_type: z.enum([
    "checking", "savings", "investment", "property", "cash", "other_asset",
    "credit_card", "mortgage", "student_loan", "personal_loan", "other_liability",
  ]),
  currency: z.string().min(3).max(3),
  opening_balance: z.string(),
  notes: z.string().max(500).optional(),
});

export type AccountFormValues = z.infer<typeof accountFormSchema>;

// ============================================================
// Category form schema
// ============================================================

export const categoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required").max(60),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color"),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
