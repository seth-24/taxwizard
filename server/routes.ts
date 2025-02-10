import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { taxCalculationSchema } from "@shared/schema";
import { ZodError } from "zod";

export function registerRoutes(app: Express) {
  app.post("/api/calculate-tax", async (req, res) => {
    try {
      // Parse and validate the request body
      const data = taxCalculationSchema.parse({
        income: Number(req.body.income),
        filingStatus: req.body.filingStatus,
        state: req.body.state,
        standardDeduction: Number(req.body.standardDeduction),
        additionalDeductions: req.body.additionalDeductions ? Number(req.body.additionalDeductions) : 0,
      });

      const result = await storage.calculateTax({
        income: String(data.income),
        filingStatus: data.filingStatus,
        state: data.state,
        standardDeduction: String(data.standardDeduction),
        additionalDeductions: data.additionalDeductions ? String(data.additionalDeductions) : null,
      });

      res.json(result);
    } catch (error) {
      console.error('Calculate tax error:', error);
      if (error instanceof ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get("/api/tax-brackets/:filingStatus", async (req, res) => {
    try {
      const brackets = await storage.getTaxBrackets(req.params.filingStatus);
      res.json(brackets);
    } catch (error) {
      console.error('Get tax brackets error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/tax-history", async (req, res) => {
    try {
      const history = await storage.getCalculationHistory();
      res.json(history);
    } catch (error) {
      console.error('Get tax history error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return createServer(app);
}