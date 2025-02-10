import { pgTable, text, integer, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const taxCalculations = pgTable("tax_calculations", {
  id: integer("id").primaryKey(),
  income: decimal("income", { precision: 10, scale: 2 }).notNull(),
  filingStatus: text("filing_status").notNull(),
  state: text("state").notNull(),
  standardDeduction: decimal("standard_deduction", { precision: 10, scale: 2 }).notNull(),
  additionalDeductions: decimal("additional_deductions", { precision: 10, scale: 2 }).default("0"),
});

export const insertTaxCalculationSchema = createInsertSchema(taxCalculations).omit({ id: true });

export const filingStatusEnum = z.enum(["single", "married", "headOfHousehold"]);
export const stateEnum = z.enum(["CA", "NY", "TX", "FL"]);

export const taxCalculationSchema = insertTaxCalculationSchema.extend({
  income: z.number().min(0),
  filingStatus: filingStatusEnum,
  state: stateEnum,
  standardDeduction: z.number().min(0),
  additionalDeductions: z.number().min(0),
});

export type TaxCalculation = typeof taxCalculations.$inferSelect;
export type InsertTaxCalculation = z.infer<typeof insertTaxCalculationSchema>;
export type FilingStatus = z.infer<typeof filingStatusEnum>;
export type State = z.infer<typeof stateEnum>;
