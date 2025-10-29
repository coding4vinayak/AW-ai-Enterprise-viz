import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "./queryClient";
import type { Dataset, Dashboard, Chart, Insight } from "@shared/schema";
import Papa from "papaparse";
import { useToast } from "@/hooks/use-toast";

// Dataset hooks
export function useDatasets() {
  return useQuery<Dataset[]>({
    queryKey: ["/api/datasets"],
  });
}

export function useDataset(id: string | null) {
  return useQuery<Dataset>({
    queryKey: ["/api/datasets", id],
    enabled: !!id,
  });
}

export function useUploadDataset() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (file: File) => {
      let parsedData: any[] = [];
      const fileType = file.name.endsWith(".csv") ? "csv" : "excel";

      if (fileType === "csv") {
        const text = await file.text();
        console.log("CSV file size:", text.length, "bytes");

        const result = Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.trim()
        });

        parsedData = result.data.filter((row: any) => {
          // Filter out completely empty rows
          return Object.values(row).some(val => val !== null && val !== undefined && val !== '');
        });

        console.log("Parsed CSV rows:", parsedData.length);

        if (result.errors && result.errors.length > 0) {
          console.warn("CSV parsing warnings:", result.errors);
        }
      }

      if (parsedData.length === 0) {
        throw new Error("No data found in file");
      }

      const response = await fetch("/api/datasets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name,
          type: fileType,
          data: parsedData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || "Upload failed");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/datasets"] });
      toast({
        title: "Success",
        description: "Dataset uploaded successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload dataset",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteDataset() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/datasets/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/datasets"] });
      toast({
        title: "Success",
        description: "Dataset deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete dataset",
        variant: "destructive",
      });
    },
  });
}

// Dashboard hooks
export function useDashboards() {
  return useQuery<Dashboard[]>({
    queryKey: ["/api/dashboards"],
  });
}

export function useDashboard(id: string | null) {
  return useQuery<Dashboard>({
    queryKey: ["/api/dashboards", id],
    enabled: !!id,
  });
}

export function useCreateDashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      isPreset?: boolean;
    }) => {
      return apiRequest<Dashboard>("POST", "/api/dashboards", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboards"] });
      toast({
        title: "Success",
        description: "Dashboard created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create dashboard",
        variant: "destructive",
      });
    },
  });
}

// Chart hooks
export function useCharts(dashboardId: string | null) {
  return useQuery<Chart[]>({
    queryKey: ["/api/charts", dashboardId],
    enabled: !!dashboardId,
  });
}

export function useCreateChart() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      dashboardId: string;
      datasetId: string;
      type: string;
      title: string;
      config: any;
    }) => {
      return apiRequest<Chart>("POST", "/api/charts", data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["/api/charts", variables.dashboardId],
      });
      toast({
        title: "Success",
        description: "Chart created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create chart",
        variant: "destructive",
      });
    },
  });
}

// Insights hooks
export function useInsights(dashboardId?: string) {
  return useQuery<Insight[]>({
    queryKey: dashboardId ? ["/api/insights", dashboardId] : ["/api/insights"],
  });
}

export function useGenerateInsight() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { datasetId?: string; dashboardId?: string }) => {
      return apiRequest<{ configured: boolean; insight?: Insight; message?: string }>(
        "POST",
        "/api/insights/generate",
        data
      );
    },
    onSuccess: (data) => {
      if (data.configured) {
        queryClient.invalidateQueries({ queryKey: ["/api/insights"] });
        toast({
          title: "Success",
          description: "Insight generated successfully",
        });
      } else {
        toast({
          title: "Configuration Required",
          description: data.message,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate insight",
        variant: "destructive",
      });
    },
  });
}

// AI Chat hook
export function useChatWithAI() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      messages: Array<{ role: "user" | "assistant"; content: string }>;
      datasetId?: string;
    }) => {
      return apiRequest<{ configured: boolean; message: string }>(
        "POST",
        "/api/chat",
        data
      );
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });
}

// AI Status hook
export function useAIStatus() {
  return useQuery<{ configured: boolean }>({
    queryKey: ["/api/ai/status"],
    staleTime: 60000, // Cache for 1 minute
  });
}

// Export hook
export function useExportData() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      format: string;
      datasetId?: string;
      chartData?: any[];
    }) => {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `export.${data.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return true;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Data exported successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to export data",
        variant: "destructive",
      });
    },
  });
}