import { taxCalculations, type TaxCalculation, type InsertTaxCalculation, documents, type Document, type InsertDocument } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  calculateTax(calculation: InsertTaxCalculation): Promise<TaxCalculation & {
    federalTax: number;
    stateTax: number;
    effectiveRate: number;
  }>;
  getTaxBrackets(filingStatus: string): Promise<Array<{ min: number; max: number; rate: number }>>;
  getCalculationHistory(): Promise<TaxCalculation[]>;
  saveDocument(doc: Omit<InsertDocument, "id">): Promise<Document>;
  getDocuments(): Promise<Document[]>;
}

export class DatabaseStorage implements IStorage {
  private readonly federalBrackets = {
    single: [
      { min: 0, max: 11000, rate: 0.10 },
      { min: 11001, max: 44725, rate: 0.12 },
      { min: 44726, max: 95375, rate: 0.22 },
      { min: 95376, max: 182100, rate: 0.24 },
      { min: 182101, max: 231250, rate: 0.32 },
      { min: 231251, max: 578125, rate: 0.35 },
      { min: 578126, max: Infinity, rate: 0.37 }
    ],
    married: [
      { min: 0, max: 22000, rate: 0.10 },
      { min: 22001, max: 89450, rate: 0.12 },
      { min: 89451, max: 190750, rate: 0.22 },
      { min: 190751, max: 364200, rate: 0.24 },
      { min: 364201, max: 462500, rate: 0.32 },
      { min: 462501, max: 693750, rate: 0.35 },
      { min: 693751, max: Infinity, rate: 0.37 }
    ],
    headOfHousehold: [
      { min: 0, max: 15700, rate: 0.10 },
      { min: 15701, max: 59850, rate: 0.12 },
      { min: 59851, max: 95350, rate: 0.22 },
      { min: 95351, max: 182100, rate: 0.24 },
      { min: 182101, max: 231250, rate: 0.32 },
      { min: 231251, max: 578100, rate: 0.35 },
      { min: 578101, max: Infinity, rate: 0.37 }
    ]
  };

  private readonly stateTaxRates: Record<string, number> = {
    AL: 0.0500, AK: 0.0000, AZ: 0.0459, AR: 0.0550, CA: 0.0930, CO: 0.0455,
    CT: 0.0699, DE: 0.0660, FL: 0.0000, GA: 0.0575, HI: 0.1100, ID: 0.0580,
    IL: 0.0495, IN: 0.0323, IA: 0.0600, KS: 0.0570, KY: 0.0500, LA: 0.0425,
    ME: 0.0715, MD: 0.0575, MA: 0.0500, MI: 0.0425, MN: 0.0985, MS: 0.0500,
    MO: 0.0495, MT: 0.0675, NE: 0.0684, NV: 0.0000, NH: 0.0500, NJ: 0.1075,
    NM: 0.0590, NY: 0.0685, NC: 0.0499, ND: 0.0290, OH: 0.0399, OK: 0.0475,
    OR: 0.0990, PA: 0.0307, RI: 0.0599, SC: 0.0700, SD: 0.0000, TN: 0.0000,
    TX: 0.0000, UT: 0.0495, VT: 0.0875, VA: 0.0575, WA: 0.0000, WV: 0.0650,
    WI: 0.0765, WY: 0.0000
  };

  async calculateTax(calculation: InsertTaxCalculation) {
    try {
      const income = Number(calculation.income);
      const standardDeduction = Number(calculation.standardDeduction);
      const additionalDeductions = calculation.additionalDeductions ? Number(calculation.additionalDeductions) : 0;

      const taxableIncome = Math.max(0, income - standardDeduction - additionalDeductions);
      const brackets = this.federalBrackets[calculation.filingStatus as keyof typeof this.federalBrackets];

      let federalTax = 0;
      let remainingIncome = taxableIncome;

      for (const bracket of brackets) {
        const taxableAmount = Math.min(
          Math.max(0, remainingIncome),
          bracket.max - bracket.min
        );
        federalTax += taxableAmount * bracket.rate;
        remainingIncome -= taxableAmount;
        if (remainingIncome <= 0) break;
      }

      const stateTax = taxableIncome * this.stateTaxRates[calculation.state];
      const totalTax = federalTax + stateTax;
      const effectiveRate = income > 0 ? (totalTax / income) * 100 : 0;

      // Generate a timestamp-based ID
      const timestamp = Date.now();
      const randomSuffix = Math.floor(Math.random() * 1000);
      const id = parseInt(`${timestamp}${randomSuffix}`.slice(0, 10));

      // Insert calculation record into database with the generated ID
      const [result] = await db.insert(taxCalculations)
        .values({
          id: id,
          income: String(income),
          filingStatus: calculation.filingStatus,
          state: calculation.state,
          standardDeduction: String(standardDeduction),
          additionalDeductions: calculation.additionalDeductions ? String(additionalDeductions) : "0",
        })
        .returning();

      if (!result) {
        throw new Error("Failed to save calculation");
      }

      return {
        ...result,
        federalTax,
        stateTax,
        effectiveRate
      };
    } catch (error) {
      console.error('Tax calculation error:', error);
      throw new Error('Failed to calculate taxes. Please try again.');
    }
  }

  async getTaxBrackets(filingStatus: string) {
    return this.federalBrackets[filingStatus as keyof typeof this.federalBrackets] || [];
  }

  async getCalculationHistory(): Promise<TaxCalculation[]> {
    try {
      return await db
        .select()
        .from(taxCalculations)
        .orderBy(desc(taxCalculations.calculatedAt))
        .limit(10);
    } catch (error) {
      console.error('Error fetching calculation history:', error);
      return [];
    }
  }

  async saveDocument(doc: Omit<InsertDocument, "id">): Promise<Document> {
    try {
      const timestamp = Date.now();
      const randomSuffix = Math.floor(Math.random() * 1000);
      const id = parseInt(`${timestamp}${randomSuffix}`.slice(0, 10));

      const [document] = await db.insert(documents)
        .values({
          id: id,
          fileName: doc.fileName,
          fileType: doc.fileType,
          documentDate: new Date(doc.documentDate),
          category: doc.category,
          content: doc.content,
        })
        .returning();

      if (!document) {
        throw new Error("Failed to save document");
      }

      return document;
    } catch (error) {
      console.error('Error saving document:', error);
      throw new Error('Failed to save document. Please try again.');
    }
  }

  async getDocuments(): Promise<Document[]> {
    try {
      return await db
        .select()
        .from(documents)
        .orderBy(desc(documents.uploadedAt))
        .limit(20);
    } catch (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();