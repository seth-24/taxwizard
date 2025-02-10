import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { taxCalculationSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export function registerRoutes(app: Express) {
  app.post("/api/calculate-tax", async (req, res) => {
    try {
      const data = taxCalculationSchema.parse(req.body);
      const result = await storage.calculateTax(data);
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: fromZodError(error).message });
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

  return createServer(app);
}
