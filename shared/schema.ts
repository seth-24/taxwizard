import { pgTable, text, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const taxCalculations = pgTable("tax_calculations", {
  id: decimal("id", { precision: 10, scale: 0 }).primaryKey().notNull(),
  income: decimal("income", { precision: 10, scale: 2 }).notNull(),
  filingStatus: text("filing_status").notNull(),
  state: text("state").notNull(),
  standardDeduction: decimal("standard_deduction", { precision: 10, scale: 2 }).notNull(),
  additionalDeductions: decimal("additional_deductions", { precision: 10, scale: 2 }).default("0"),
  calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id: decimal("id", { precision: 10, scale: 0 }).primaryKey().notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  documentDate: timestamp("document_date").notNull(),
  category: text("category").notNull(),
  content: text("content").notNull(), // OCR extracted text
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const insertTaxCalculationSchema = createInsertSchema(taxCalculations)
  .omit({ 
    id: true,
    calculatedAt: true 
  });

export const insertDocumentSchema = createInsertSchema(documents)
  .omit({
    id: true,
    uploadedAt: true
  });

export const filingStatusEnum = z.enum(["single", "married", "headOfHousehold"]);
export const stateEnum = z.enum([
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
]);

export const taxCalculationSchema = z.object({
  income: z.number().min(0),
  filingStatus: filingStatusEnum,
  state: stateEnum,
  standardDeduction: z.number().min(0),
  additionalDeductions: z.number().min(0).optional().default(0),
});

export const documentSchema = z.object({
  fileName: z.string(),
  fileType: z.string(),
  documentDate: z.string(),
  category: z.string(),
  content: z.string(),
});

export type TaxCalculation = typeof taxCalculations.$inferSelect;
export type InsertTaxCalculation = z.infer<typeof insertTaxCalculationSchema>;
export type FilingStatus = z.infer<typeof filingStatusEnum>;
export type State = z.infer<typeof stateEnum>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;