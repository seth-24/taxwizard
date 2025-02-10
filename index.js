var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  documentSchema: () => documentSchema,
  documents: () => documents,
  filingStatusEnum: () => filingStatusEnum,
  insertDocumentSchema: () => insertDocumentSchema,
  insertTaxCalculationSchema: () => insertTaxCalculationSchema,
  stateEnum: () => stateEnum,
  taxCalculationSchema: () => taxCalculationSchema,
  taxCalculations: () => taxCalculations
});
import { pgTable, text, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var taxCalculations = pgTable("tax_calculations", {
  id: decimal("id", { precision: 10, scale: 0 }).primaryKey().notNull(),
  income: decimal("income", { precision: 10, scale: 2 }).notNull(),
  filingStatus: text("filing_status").notNull(),
  state: text("state").notNull(),
  standardDeduction: decimal("standard_deduction", { precision: 10, scale: 2 }).notNull(),
  additionalDeductions: decimal("additional_deductions", { precision: 10, scale: 2 }).default("0"),
  calculatedAt: timestamp("calculated_at").defaultNow().notNull()
});
var documents = pgTable("documents", {
  id: decimal("id", { precision: 10, scale: 0 }).primaryKey().notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  documentDate: timestamp("document_date").notNull(),
  category: text("category").notNull(),
  content: text("content").notNull(),
  // OCR extracted text
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull()
});
var insertTaxCalculationSchema = createInsertSchema(taxCalculations).omit({
  id: true,
  calculatedAt: true
});
var insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedAt: true
});
var filingStatusEnum = z.enum(["single", "married", "headOfHousehold"]);
var stateEnum = z.enum([
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY"
]);
var taxCalculationSchema = z.object({
  income: z.number().min(0),
  filingStatus: filingStatusEnum,
  state: stateEnum,
  standardDeduction: z.number().min(0),
  additionalDeductions: z.number().min(0).optional().default(0)
});
var documentSchema = z.object({
  fileName: z.string(),
  fileType: z.string(),
  documentDate: z.string(),
  category: z.string(),
  content: z.string()
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { desc } from "drizzle-orm";
var DatabaseStorage = class {
  federalBrackets = {
    single: [
      { min: 0, max: 11e3, rate: 0.1 },
      { min: 11001, max: 44725, rate: 0.12 },
      { min: 44726, max: 95375, rate: 0.22 },
      { min: 95376, max: 182100, rate: 0.24 },
      { min: 182101, max: 231250, rate: 0.32 },
      { min: 231251, max: 578125, rate: 0.35 },
      { min: 578126, max: Infinity, rate: 0.37 }
    ],
    married: [
      { min: 0, max: 22e3, rate: 0.1 },
      { min: 22001, max: 89450, rate: 0.12 },
      { min: 89451, max: 190750, rate: 0.22 },
      { min: 190751, max: 364200, rate: 0.24 },
      { min: 364201, max: 462500, rate: 0.32 },
      { min: 462501, max: 693750, rate: 0.35 },
      { min: 693751, max: Infinity, rate: 0.37 }
    ],
    headOfHousehold: [
      { min: 0, max: 15700, rate: 0.1 },
      { min: 15701, max: 59850, rate: 0.12 },
      { min: 59851, max: 95350, rate: 0.22 },
      { min: 95351, max: 182100, rate: 0.24 },
      { min: 182101, max: 231250, rate: 0.32 },
      { min: 231251, max: 578100, rate: 0.35 },
      { min: 578101, max: Infinity, rate: 0.37 }
    ]
  };
  stateTaxRates = {
    AL: 0.05,
    AK: 0,
    AZ: 0.0459,
    AR: 0.055,
    CA: 0.093,
    CO: 0.0455,
    CT: 0.0699,
    DE: 0.066,
    FL: 0,
    GA: 0.0575,
    HI: 0.11,
    ID: 0.058,
    IL: 0.0495,
    IN: 0.0323,
    IA: 0.06,
    KS: 0.057,
    KY: 0.05,
    LA: 0.0425,
    ME: 0.0715,
    MD: 0.0575,
    MA: 0.05,
    MI: 0.0425,
    MN: 0.0985,
    MS: 0.05,
    MO: 0.0495,
    MT: 0.0675,
    NE: 0.0684,
    NV: 0,
    NH: 0.05,
    NJ: 0.1075,
    NM: 0.059,
    NY: 0.0685,
    NC: 0.0499,
    ND: 0.029,
    OH: 0.0399,
    OK: 0.0475,
    OR: 0.099,
    PA: 0.0307,
    RI: 0.0599,
    SC: 0.07,
    SD: 0,
    TN: 0,
    TX: 0,
    UT: 0.0495,
    VT: 0.0875,
    VA: 0.0575,
    WA: 0,
    WV: 0.065,
    WI: 0.0765,
    WY: 0
  };
  async calculateTax(calculation) {
    try {
      const income = Number(calculation.income);
      const standardDeduction = Number(calculation.standardDeduction);
      const additionalDeductions = calculation.additionalDeductions ? Number(calculation.additionalDeductions) : 0;
      const taxableIncome = Math.max(0, income - standardDeduction - additionalDeductions);
      const brackets = this.federalBrackets[calculation.filingStatus];
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
      const effectiveRate = income > 0 ? totalTax / income * 100 : 0;
      const timestamp2 = Date.now();
      const randomSuffix = Math.floor(Math.random() * 1e3);
      const id = parseInt(`${timestamp2}${randomSuffix}`.slice(0, 10));
      const [result] = await db.insert(taxCalculations).values({
        id,
        income: String(income),
        filingStatus: calculation.filingStatus,
        state: calculation.state,
        standardDeduction: String(standardDeduction),
        additionalDeductions: calculation.additionalDeductions ? String(additionalDeductions) : "0"
      }).returning();
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
      console.error("Tax calculation error:", error);
      throw new Error("Failed to calculate taxes. Please try again.");
    }
  }
  async getTaxBrackets(filingStatus) {
    return this.federalBrackets[filingStatus] || [];
  }
  async getCalculationHistory() {
    try {
      return await db.select().from(taxCalculations).orderBy(desc(taxCalculations.calculatedAt)).limit(10);
    } catch (error) {
      console.error("Error fetching calculation history:", error);
      return [];
    }
  }
  async saveDocument(doc) {
    try {
      const timestamp2 = Date.now();
      const randomSuffix = Math.floor(Math.random() * 1e3);
      const id = parseInt(`${timestamp2}${randomSuffix}`.slice(0, 10));
      const [document] = await db.insert(documents).values({
        id,
        fileName: doc.fileName,
        fileType: doc.fileType,
        documentDate: new Date(doc.documentDate),
        category: doc.category,
        content: doc.content
      }).returning();
      if (!document) {
        throw new Error("Failed to save document");
      }
      return document;
    } catch (error) {
      console.error("Error saving document:", error);
      throw new Error("Failed to save document. Please try again.");
    }
  }
  async getDocuments() {
    try {
      return await db.select().from(documents).orderBy(desc(documents.uploadedAt)).limit(20);
    } catch (error) {
      console.error("Error fetching documents:", error);
      return [];
    }
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import { ZodError } from "zod";
function registerRoutes(app2) {
  app2.post("/api/calculate-tax", async (req, res) => {
    try {
      const data = taxCalculationSchema.parse({
        income: Number(req.body.income),
        filingStatus: req.body.filingStatus,
        state: req.body.state,
        standardDeduction: Number(req.body.standardDeduction),
        additionalDeductions: req.body.additionalDeductions ? Number(req.body.additionalDeductions) : 0
      });
      const result = await storage.calculateTax({
        income: String(data.income),
        filingStatus: data.filingStatus,
        state: data.state,
        standardDeduction: String(data.standardDeduction),
        additionalDeductions: data.additionalDeductions ? String(data.additionalDeductions) : null
      });
      res.json(result);
    } catch (error) {
      console.error("Calculate tax error:", error);
      if (error instanceof ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });
  app2.get("/api/tax-brackets/:filingStatus", async (req, res) => {
    try {
      const brackets = await storage.getTaxBrackets(req.params.filingStatus);
      res.json(brackets);
    } catch (error) {
      console.error("Get tax brackets error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/tax-history", async (req, res) => {
    try {
      const history = await storage.getCalculationHistory();
      res.json(history);
    } catch (error) {
      console.error("Get tax history error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/documents", async (req, res) => {
    try {
      const { image } = req.body;
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      const fileName = `scan_${Date.now()}.jpg`;
      const documentDate = (/* @__PURE__ */ new Date()).toISOString();
      const category = "tax_document";
      const content = "Document content would be extracted via OCR";
      const document = await storage.saveDocument({
        fileName,
        fileType: "image/jpeg",
        documentDate,
        category,
        content
      });
      res.json(document);
    } catch (error) {
      console.error("Save document error:", error);
      res.status(500).json({ message: "Failed to save document" });
    }
  });
  app2.get("/api/documents", async (req, res) => {
    try {
      const documents2 = await storage.getDocuments();
      res.json(documents2);
    } catch (error) {
      console.error("Get documents error:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });
  return createServer(app2);
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [react(), runtimeErrorOverlay(), themePlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json({ limit: "50mb" }));
app.use(express2.urlencoded({ extended: false, limit: "50mb" }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const PORT = 5e3;
  server.listen(PORT, "0.0.0.0", () => {
    log(`serving on port ${PORT}`);
  });
})();
