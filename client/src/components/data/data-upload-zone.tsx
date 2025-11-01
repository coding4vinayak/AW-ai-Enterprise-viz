import { Upload, FileSpreadsheet, X } from "lucide-react";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useUploadDataset } from "@/lib/api-hooks";
import { useQueryClient } from "@tanstack/react-query";

interface DataUploadZoneProps {
  onUploadComplete?: () => void;
}

export function DataUploadZone({ onUploadComplete }: DataUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);
  const { toast } = useToast();
  const uploadMutation = useUploadDataset();
  const queryClient = useQueryClient();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const validFile = files.find(
      (file) =>
        file.type === "text/csv" ||
        file.type === "application/vnd.ms-excel" ||
        file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    if (validFile) {
      performUpload(validFile);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV or Excel file",
        variant: "destructive",
      });
    }
  };

  const performUpload = async (file: File) => {
    setUploadingFile(file.name);
    setUploadProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 20, 90));
    }, 200);

    try {
      await uploadMutation.mutateAsync(file);
      setUploadProgress(100);
      
      // Invalidate queries to refresh data across the app
      await queryClient.invalidateQueries({ queryKey: ["/api/datasets"] });
      
      setTimeout(() => {
        setUploadingFile(null);
        setUploadProgress(0);
        onUploadComplete?.();
      }, 500);
    } catch (error) {
      setUploadingFile(null);
      setUploadProgress(0);
    } finally {
      clearInterval(interval);
    }
  };

  return (
    <div className="space-y-4">
      {uploadingFile ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-10 w-10 text-primary" />
              <div>
                <p className="font-medium">{uploadingFile}</p>
                <p className="text-sm text-muted-foreground">Uploading and processing...</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setUploadingFile(null)}
              data-testid="button-cancel-upload"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Progress value={uploadProgress} data-testid="progress-upload" />
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-lg p-12 transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          data-testid="dropzone-upload"
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileInput}
            data-testid="input-file-upload"
          />

          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Upload className="h-10 w-10 text-primary" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Upload your data file</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Drag and drop your CSV or Excel file here, or click to browse
              </p>
            </div>

            <label htmlFor="file-upload">
              <Button
                variant="default"
                size="lg"
                asChild
                data-testid="button-browse"
                disabled={uploadMutation.isPending}
              >
                <span className="cursor-pointer">
                  <FileSpreadsheet className="h-4 w-4" />
                  Browse Files
                </span>
              </Button>
            </label>

            <p className="text-xs text-muted-foreground">
              Supported formats: CSV, XLSX, XLS (Max 50MB)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
