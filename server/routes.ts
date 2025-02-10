import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { taxCalculationSchema } from "@shared/schema";
import { ZodError } from "zod";

export function registerRoutes(app: Express) {
  app.post("/api/calculate-tax", async (req, res) => {
    try {
      const data = taxCalculationSchema.parse(req.body);
      const result = await storage.calculateTax(data);
      res.json(result);
    } catch (error) {
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
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/tax-history", async (req, res) => {
    try {
      const history = await storage.getCalculationHistory();
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return createServer(app);
}