import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDatasetSchema, insertDashboardSchema, insertChartSchema, insertInsightSchema, insertCustomMetricSchema } from "@shared/schema";
import { z } from "zod";
import Papa from "papaparse";
import ExcelJS from "exceljs";
import { generateInsight, chatWithAI, isOpenAIConfigured } from "./lib/openai";
import { authenticateUser } from "./middleware/auth";
import { requireRole } from "./middleware/rbac";

// TODO: Replace with proper auth middleware that gets customerId from session
async function getCustomerId(): Promise<string> {
  const defaultCustomer = await storage.getCustomerBySlug("default");
  if (!defaultCustomer) {
    throw new Error("Default customer not found. Please run seed script.");
  }
  return defaultCustomer.id;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Dataset routes
  app.post("/api/datasets", authenticateUser, async (req, res) => {
    try {
      const customerId = req.user!.customerId;
      const { name, type, data } = req.body;

      console.log("Dataset upload request:", { name, type, dataType: typeof data, dataLength: Array.isArray(data) ? data.length : 'not array' });

      if (!name || !type || !data) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Parse the data to detect schema
      let parsedData: any[] = [];
      let columns: any[] = [];

      if (type === "csv" || type === "excel") {
        // Data should be already parsed from frontend
        if (Array.isArray(data)) {
          parsedData = data;
        } else if (typeof data === 'string') {
          // If data is a string, try to parse it as CSV
          console.log("Parsing CSV string data");
          const parseResult = Papa.parse(data, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true
          });
          parsedData = parseResult.data;
          console.log("Parsed data rows:", parsedData.length);
        } else {
          return res.status(400).json({ error: "Invalid data format" });
        }
      }

      if (parsedData.length === 0) {
        return res.status(400).json({ error: "No data rows found in file" });
      }

      // Detect schema from first few rows
      const firstRow = parsedData[0];
      columns = Object.keys(firstRow).map((key) => {
        const sample = firstRow[key];
        let colType: "string" | "number" | "date" | "boolean" = "string";

        if (typeof sample === "number") {
          colType = "number";
        } else if (typeof sample === "boolean") {
          colType = "boolean";
        } else if (sample && !isNaN(Date.parse(String(sample)))) {
          // Check if it looks like a date
          const dateStr = String(sample);
          if (dateStr.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
            colType = "date";
          }
        }

        return {
          name: key,
          type: colType,
          sample: sample,
        };
      });

      console.log("Creating dataset with", parsedData.length, "rows and", columns.length, "columns");

      // Create the dataset with tenant isolation
      const dataset = await storage.createDataset({
        name,
        type,
        uploadedData: parsedData,
        schemaInfo: { columns },
        rowCount: parsedData.length,
      }, customerId);

      console.log("Dataset created successfully:", dataset.id);
      res.json(dataset);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        error: "Failed to upload dataset",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.get("/api/datasets", authenticateUser, async (req, res) => {
    try {
      const customerId = req.user!.customerId;
      const datasets = await storage.getDatasets(customerId);
      res.json(datasets);
    } catch (error) {
      console.error("Get datasets error:", error);
      res.status(500).json({ error: "Failed to fetch datasets" });
    }
  });

  app.get("/api/datasets/:id", authenticateUser, async (req, res) => {
    try {
      const customerId = req.user!.customerId;
      const dataset = await storage.getDatasetById(req.params.id, customerId);
      if (!dataset) {
        return res.status(404).json({ error: "Dataset not found" });
      }
      res.json(dataset);
    } catch (error) {
      console.error("Get dataset error:", error);
      res.status(500).json({ error: "Failed to fetch dataset" });
    }
  });

  app.delete("/api/datasets/:id", authenticateUser, requireRole(['customer_admin', 'analyst', 'super_admin']), async (req, res) => {
    try {
      const customerId = req.user!.customerId;
      await storage.deleteDataset(req.params.id, customerId);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete dataset error:", error);
      res.status(500).json({ error: "Failed to delete dataset" });
    }
  });

  // Dashboard routes - require authentication
  app.post("/api/dashboards", authenticateUser, requireRole(['customer_admin', 'analyst', 'super_admin']), async (req, res) => {
    try {
      const customerId = req.user!.customerId;
      const validatedData = insertDashboardSchema.parse(req.body);
      const newDashboard = await storage.createDashboard(validatedData, customerId);

      res.json(newDashboard);
    } catch (error: any) {
      console.error("Dashboard creation error:", error);
      res.status(400).json({ error: error.message || "Failed to create dashboard" });
    }
  });

  app.get("/api/dashboards", authenticateUser, async (req, res) => {
    try {
      const customerId = req.user!.customerId;
      const dashboards = await storage.getDashboards(customerId);
      res.json(dashboards);
    } catch (error) {
      console.error("Get dashboards error:", error);
      res.status(500).json({ error: "Failed to fetch dashboards" });
    }
  });

  app.get("/api/dashboards/:id", authenticateUser, async (req, res) => {
    try {
      const customerId = req.user!.customerId;
      const dashboard = await storage.getDashboard(req.params.id, customerId);
      if (!dashboard) {
        return res.status(404).json({ error: "Dashboard not found" });
      }
      res.json(dashboard);
    } catch (error) {
      console.error("Get dashboard error:", error);
      res.status(500).json({ error: "Failed to fetch dashboard" });
    }
  });

  app.put("/api/dashboards/:id", authenticateUser, requireRole(['customer_admin', 'analyst', 'super_admin']), async (req, res) => {
    try {
      const customerId = req.user!.customerId;
      const dashboard = await storage.updateDashboard(req.params.id, req.body, customerId);
      if (!dashboard) {
        return res.status(404).json({ error: "Dashboard not found" });
      }
      res.json(dashboard);
    } catch (error) {
      console.error("Update dashboard error:", error);
      res.status(500).json({ error: "Failed to update dashboard" });
    }
  });

  app.delete("/api/dashboards/:id", authenticateUser, requireRole(['customer_admin', 'analyst', 'super_admin']), async (req, res) => {
    try {
      const customerId = req.user!.customerId;
      await storage.deleteDashboard(req.params.id, customerId);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete dashboard error:", error);
      res.status(500).json({ error: "Failed to delete dashboard" });
    }
  });

  // Chart routes
  app.post("/api/charts", authenticateUser, requireRole(['customer_admin', 'analyst', 'super_admin']), async (req, res) => {
    try {
      const customerId = req.user!.customerId;
      const validated = insertChartSchema.parse(req.body);
      const chart = await storage.createChart({...validated, customerId});
      res.json(chart);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Create chart error:", error);
      res.status(500).json({ error: "Failed to create chart" });
    }
  });

  app.get("/api/charts", authenticateUser, async (req, res) => {
    try {
      const customerId = req.user!.customerId;
      const { dashboardId } = req.query;
      if (!dashboardId || typeof dashboardId !== "string") {
        return res.status(400).json({ error: "dashboardId is required" });
      }
      const charts = await storage.getCharts(dashboardId, customerId);
      res.json(charts);
    } catch (error) {
      console.error("Get charts error:", error);
      res.status(500).json({ error: "Failed to fetch charts" });
    }
  });

  app.put("/api/charts/:id", authenticateUser, requireRole(['customer_admin', 'analyst', 'super_admin']), async (req, res) => {
    try {
      const customerId = req.user!.customerId;
      const chart = await storage.updateChart(req.params.id, req.body, customerId);
      if (!chart) {
        return res.status(404).json({ error: "Chart not found" });
      }
      res.json(chart);
    } catch (error) {
      console.error("Update chart error:", error);
      res.status(500).json({ error: "Failed to update chart" });
    }
  });

  app.delete("/api/charts/:id", authenticateUser, requireRole(['customer_admin', 'analyst', 'super_admin']), async (req, res) => {
    try {
      const customerId = req.user!.customerId;
      await storage.deleteChart(req.params.id, customerId);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete chart error:", error);
      res.status(500).json({ error: "Failed to delete chart" });
    }
  });

  // Insights routes - require authentication
  app.post("/api/insights/generate", authenticateUser, requireRole(['customer_admin', 'analyst', 'super_admin']), async (req, res) => {
    try {
      const customerId = req.user!.customerId;
      const { datasetId, dashboardId, type = "summary" } = req.body;

      if (!isOpenAIConfigured()) {
        return res.json({
          configured: false,
          message: "OpenAI API key not configured. Please add your API key in Settings.",
        });
      }

      let dataContext = "";

      if (datasetId) {
        const dataset = await storage.getDataset(datasetId, customerId);
        if (dataset) {
          const sampleData = (dataset.uploadedData as any[]).slice(0, 20);
          dataContext = `Dataset: ${dataset.name}\nRows: ${dataset.rowCount}\nSample Data:\n${JSON.stringify(sampleData, null, 2)}`;
        }
      }

      const content = await generateInsight(dataContext);

      const newInsight = await storage.createInsight({
        type,
        content,
        datasetId: datasetId || null,
        dashboardId: dashboardId || null,
      }, customerId);


      res.json({ configured: true, insight: newInsight });
    } catch (error) {
      console.error("Generate insight error:", error);
      res.status(500).json({ error: "Failed to generate insight" });
    }
  });

  app.get("/api/insights", authenticateUser, async (req, res) => {
    try {
      const customerId = req.user!.customerId;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const datasetId = req.query.datasetId as string | undefined;
      const insights = await storage.getInsights(customerId, limit, datasetId);
      res.json(insights);
    } catch (error) {
      console.error("Get insights error:", error);
      res.status(500).json({ error: "Failed to fetch insights" });
    }
  });

  // AI Chat route
  app.post("/api/chat", authenticateUser, async (req, res) => {
    try {
      const customerId = req.user!.customerId;
      const { messages, datasetId } = req.body;

      if (!isOpenAIConfigured()) {
        return res.json({
          configured: false,
          message: "To enable AI-powered responses, please configure your OpenAI API key in Settings. Once configured, I'll be able to analyze your data and provide intelligent insights based on your questions.",
        });
      }

      let dataContext = undefined;

      if (datasetId) {
        const dataset = await storage.getDataset(datasetId, customerId);
        if (dataset) {
          const sampleData = (dataset.uploadedData as any[]).slice(0, 20);
          dataContext = `Dataset: ${dataset.name}\nRows: ${dataset.rowCount}\nSchema: ${JSON.stringify((dataset.schemaInfo as any).columns)}\nSample Data:\n${JSON.stringify(sampleData, null, 2)}`;
        }
      }

      const response = await chatWithAI(messages, dataContext);
      res.json({ configured: true, message: response });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  // Custom metrics routes
  app.post("/api/metrics", authenticateUser, requireRole(['customer_admin', 'analyst', 'super_admin']), async (req, res) => {
    try {
      const customerId = req.user!.customerId;
      const validated = insertCustomMetricSchema.parse(req.body);
      const metric = await storage.createCustomMetric({...validated, customerId});
      res.json(metric);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Create metric error:", error);
      res.status(500).json({ error: "Failed to create metric" });
    }
  });

  app.get("/api/metrics/:datasetId", authenticateUser, async (req, res) => {
    try {
      const customerId = req.user!.customerId;
      const metrics = await storage.getCustomMetrics(req.params.datasetId, customerId);
      res.json(metrics);
    } catch (error) {
      console.error("Get metrics error:", error);
      res.status(500).json({ error: "Failed to fetch metrics" });
    }
  });

  app.delete("/api/metrics/:id", authenticateUser, requireRole(['customer_admin', 'analyst', 'super_admin']), async (req, res) => {
    try {
      const customerId = req.user!.customerId;
      await storage.deleteCustomMetric(req.params.id, customerId);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete metric error:", error);
      res.status(500).json({ error: "Failed to delete metric" });
    }
  });

  // Export route
  app.post("/api/export", authenticateUser, async (req, res) => {
    try {
      const customerId = req.user!.customerId;
      const { format, datasetId, chartData } = req.body;

      if (format === "csv") {
        let data = chartData;

        if (datasetId) {
          const dataset = await storage.getDataset(datasetId, customerId);
          if (dataset) {
            data = dataset.uploadedData;
          }
        }

        const csv = Papa.unparse(data);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=export.csv");
        res.send(csv);
      } else {
        res.status(400).json({ error: "Unsupported export format" });
      }
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ error: "Failed to export data" });
    }
  });

  // Check AI configuration status
  app.get("/api/ai/status", async (req, res) => {
    res.json({ configured: isOpenAIConfigured() });
  });

  const httpServer = createServer(app);
  return httpServer;
}