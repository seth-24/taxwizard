import { taxCalculations, type TaxCalculation, type InsertTaxCalculation } from "@shared/schema";

export interface IStorage {
  calculateTax(calculation: InsertTaxCalculation): Promise<TaxCalculation & {
    federalTax: number;
    stateTax: number;
    effectiveRate: number;
  }>;
  getTaxBrackets(filingStatus: string): Promise<Array<{ min: number; max: number; rate: number }>>;
}

export class MemStorage implements IStorage {
  private currentId = 1;
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

  private readonly stateTaxRates = {
    CA: 0.0930,
    NY: 0.0685,
    TX: 0,
    FL: 0
  };

  async calculateTax(calculation: InsertTaxCalculation) {
    const taxableIncome = Number(calculation.income) - Number(calculation.standardDeduction) - Number(calculation.additionalDeductions);
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

    const stateTax = taxableIncome * this.stateTaxRates[calculation.state as keyof typeof this.stateTaxRates];
    const totalTax = federalTax + stateTax;
    const effectiveRate = (totalTax / Number(calculation.income)) * 100;

    return {
      id: this.currentId++,
      ...calculation,
      federalTax,
      stateTax,
      effectiveRate
    };
  }

  async getTaxBrackets(filingStatus: string) {
    return this.federalBrackets[filingStatus as keyof typeof this.federalBrackets];
  }
}

export const storage = new MemStorage();
