import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDatasetSchema, insertDashboardSchema, insertChartSchema, insertInsightSchema, insertCustomMetricSchema } from "@shared/schema";
import { z } from "zod";
import Papa from "papaparse";
import ExcelJS from "exceljs";
import { generateInsight, chatWithAI, isOpenAIConfigured } from "./lib/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dataset routes
  app.post("/api/datasets", async (req, res) => {
    try {
      const { name, type, data } = req.body;

      if (!name || !type || !data) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Parse the data to detect schema
      let parsedData: any[] = [];
      let columns: any[] = [];

      if (type === "csv") {
        // Data is already parsed from frontend
        parsedData = Array.isArray(data) ? data : [];
      } else if (type === "excel") {
        parsedData = Array.isArray(data) ? data : [];
      }

      // Detect schema from first few rows
      if (parsedData.length > 0) {
        const firstRow = parsedData[0];
        columns = Object.keys(firstRow).map((key) => {
          const sample = firstRow[key];
          let colType: "string" | "number" | "date" | "boolean" = "string";

          if (typeof sample === "number") {
            colType = "number";
          } else if (typeof sample === "boolean") {
            colType = "boolean";
          } else if (!isNaN(Date.parse(String(sample)))) {
            colType = "date";
          }

          return {
            name: key,
            type: colType,
            sample: sample,
          };
        });
      }

      const dataset = await storage.createDataset({
        name,
        type,
        uploadedData: parsedData,
        schemaInfo: { columns },
        rowCount: parsedData.length,
      });

      res.json(dataset);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload dataset" });
    }
  });

  app.get("/api/datasets", async (req, res) => {
    try {
      const datasets = await storage.getDatasets();
      res.json(datasets);
    } catch (error) {
      console.error("Get datasets error:", error);
      res.status(500).json({ error: "Failed to fetch datasets" });
    }
  });

  app.get("/api/datasets/:id", async (req, res) => {
    try {
      const dataset = await storage.getDataset(req.params.id);
      if (!dataset) {
        return res.status(404).json({ error: "Dataset not found" });
      }
      res.json(dataset);
    } catch (error) {
      console.error("Get dataset error:", error);
      res.status(500).json({ error: "Failed to fetch dataset" });
    }
  });

  app.delete("/api/datasets/:id", async (req, res) => {
    try {
      await storage.deleteDataset(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete dataset error:", error);
      res.status(500).json({ error: "Failed to delete dataset" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboards", async (req, res) => {
    try {
      const dashboards = await storage.getDashboards();
      res.json(dashboards);
    } catch (error) {
      console.error("Get dashboards error:", error);
      res.status(500).json({ error: "Failed to fetch dashboards" });
    }
  });

  app.post("/api/dashboards", async (req, res) => {
    try {
      const validated = insertDashboardSchema.parse(req.body);
      const dashboard = await storage.createDashboard(validated);
      res.json(dashboard);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Create dashboard error:", error);
      res.status(500).json({ error: "Failed to create dashboard" });
    }
  });

  app.get("/api/dashboards/:id", async (req, res) => {
    try {
      const dashboard = await storage.getDashboard(req.params.id);
      if (!dashboard) {
        return res.status(404).json({ error: "Dashboard not found" });
      }
      res.json(dashboard);
    } catch (error) {
      console.error("Get dashboard error:", error);
      res.status(500).json({ error: "Failed to fetch dashboard" });
    }
  });

  app.put("/api/dashboards/:id", async (req, res) => {
    try {
      const dashboard = await storage.updateDashboard(req.params.id, req.body);
      if (!dashboard) {
        return res.status(404).json({ error: "Dashboard not found" });
      }
      res.json(dashboard);
    } catch (error) {
      console.error("Update dashboard error:", error);
      res.status(500).json({ error: "Failed to update dashboard" });
    }
  });

  app.delete("/api/dashboards/:id", async (req, res) => {
    try {
      await storage.deleteDashboard(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete dashboard error:", error);
      res.status(500).json({ error: "Failed to delete dashboard" });
    }
  });

  // Chart routes
  app.post("/api/charts", async (req, res) => {
    try {
      const validated = insertChartSchema.parse(req.body);
      const chart = await storage.createChart(validated);
      res.json(chart);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Create chart error:", error);
      res.status(500).json({ error: "Failed to create chart" });
    }
  });

  app.get("/api/charts", async (req, res) => {
    try {
      const { dashboardId } = req.query;
      if (!dashboardId || typeof dashboardId !== "string") {
        return res.status(400).json({ error: "dashboardId is required" });
      }
      const charts = await storage.getCharts(dashboardId);
      res.json(charts);
    } catch (error) {
      console.error("Get charts error:", error);
      res.status(500).json({ error: "Failed to fetch charts" });
    }
  });

  app.put("/api/charts/:id", async (req, res) => {
    try {
      const chart = await storage.updateChart(req.params.id, req.body);
      if (!chart) {
        return res.status(404).json({ error: "Chart not found" });
      }
      res.json(chart);
    } catch (error) {
      console.error("Update chart error:", error);
      res.status(500).json({ error: "Failed to update chart" });
    }
  });

  app.delete("/api/charts/:id", async (req, res) => {
    try {
      await storage.deleteChart(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete chart error:", error);
      res.status(500).json({ error: "Failed to delete chart" });
    }
  });

  // Insights routes
  app.post("/api/insights/generate", async (req, res) => {
    try {
      const { datasetId, dashboardId, type = "summary" } = req.body;

      if (!isOpenAIConfigured()) {
        return res.json({
          configured: false,
          message: "OpenAI API key not configured. Please add your API key in Settings.",
        });
      }

      let dataContext = "";
      
      if (datasetId) {
        const dataset = await storage.getDataset(datasetId);
        if (dataset) {
          const sampleData = (dataset.uploadedData as any[]).slice(0, 20);
          dataContext = `Dataset: ${dataset.name}\nRows: ${dataset.rowCount}\nSample Data:\n${JSON.stringify(sampleData, null, 2)}`;
        }
      }

      const content = await generateInsight(dataContext);

      const insight = await storage.createInsight({
        datasetId: datasetId || null,
        dashboardId: dashboardId || null,
        type,
        content,
        metadata: null,
      });

      res.json({ configured: true, insight });
    } catch (error) {
      console.error("Generate insight error:", error);
      res.status(500).json({ error: "Failed to generate insight" });
    }
  });

  app.get("/api/insights", async (req, res) => {
    try {
      const { dashboardId, datasetId } = req.query;
      const insights = await storage.getInsights(
        dashboardId as string,
        datasetId as string
      );
      res.json(insights);
    } catch (error) {
      console.error("Get insights error:", error);
      res.status(500).json({ error: "Failed to fetch insights" });
    }
  });

  // AI Chat route
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, datasetId } = req.body;

      if (!isOpenAIConfigured()) {
        return res.json({
          configured: false,
          message: "To enable AI-powered responses, please configure your OpenAI API key in Settings. Once configured, I'll be able to analyze your data and provide intelligent insights based on your questions.",
        });
      }

      let dataContext = undefined;
      
      if (datasetId) {
        const dataset = await storage.getDataset(datasetId);
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
  app.post("/api/metrics", async (req, res) => {
    try {
      const validated = insertCustomMetricSchema.parse(req.body);
      const metric = await storage.createCustomMetric(validated);
      res.json(metric);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Create metric error:", error);
      res.status(500).json({ error: "Failed to create metric" });
    }
  });

  app.get("/api/metrics/:datasetId", async (req, res) => {
    try {
      const metrics = await storage.getCustomMetrics(req.params.datasetId);
      res.json(metrics);
    } catch (error) {
      console.error("Get metrics error:", error);
      res.status(500).json({ error: "Failed to fetch metrics" });
    }
  });

  app.delete("/api/metrics/:id", async (req, res) => {
    try {
      await storage.deleteCustomMetric(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete metric error:", error);
      res.status(500).json({ error: "Failed to delete metric" });
    }
  });

  // Export route
  app.post("/api/export", async (req, res) => {
    try {
      const { format, datasetId, chartData } = req.body;

      if (format === "csv") {
        let data = chartData;
        
        if (datasetId) {
          const dataset = await storage.getDataset(datasetId);
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
