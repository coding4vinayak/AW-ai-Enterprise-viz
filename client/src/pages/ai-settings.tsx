
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Brain, Check, X, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";

type LlmProvider = {
  id: string;
  name: string;
  type: string;
  defaultModel: string;
  isActive: boolean;
};

type CustomerLlmConfig = {
  id: string;
  providerId: string;
  model: string;
  apiKey: string;
  settings: {
    temperature?: number;
    maxTokens?: number;
  };
  isDefault: boolean;
};

export default function AISettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [testing, setTesting] = useState(false);

  const [config, setConfig] = useState({
    providerId: "",
    apiKey: "",
    model: "",
    temperature: 0.7,
    maxTokens: 1000,
  });

  // Fetch available providers
  const { data: providers = [] } = useQuery<LlmProvider[]>({
    queryKey: ["/api/llm-providers"],
  });

  // Fetch current customer config
  const { data: currentConfig } = useQuery<CustomerLlmConfig>({
    queryKey: ['/api/ai-config'],
    enabled: !!user,
  });

  // Update config when data loads
  useEffect(() => {
    if (currentConfig) {
      setConfig({
        providerId: currentConfig.providerId,
        apiKey: currentConfig.apiKey,
        model: currentConfig.model,
        temperature: currentConfig.settings?.temperature ?? 0.7,
        maxTokens: currentConfig.settings?.maxTokens ?? 1000,
      });
    }
  }, [currentConfig]);

  // Save configuration
  const saveConfig = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/ai-config', {
        method: currentConfig ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: config.providerId,
          apiKey: config.apiKey,
          model: config.model,
          settings: {
            temperature: config.temperature,
            maxTokens: config.maxTokens,
          },
          isDefault: true,
        }),
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-config'] });
      toast({ title: "AI configuration saved successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Test configuration
  const testConfig = async () => {
    setTesting(true);
    try {
      const res = await fetch('/api/ai-config/test', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: config.providerId,
          apiKey: config.apiKey,
          model: config.model,
        }),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error(await res.text());
      
      toast({ title: "Connection successful!", description: "AI provider is configured correctly" });
    } catch (error: any) {
      toast({ title: "Connection failed", description: error.message, variant: "destructive" });
    } finally {
      setTesting(false);
    }
  };

  if (user?.role === "viewer") {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Only admins and analysts can configure AI settings.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Brain className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">AI Configuration</h1>
          <p className="text-muted-foreground" data-testid="text-page-description">Configure your AI provider and settings</p>
        </div>
      </div>

      <Card data-testid="card-ai-settings">
        <CardHeader>
          <CardTitle data-testid="text-card-title">AI Provider Settings</CardTitle>
          <CardDescription data-testid="text-card-description">
            Select and configure your preferred AI provider for insights and chat features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="provider">AI Provider</Label>
            <Select value={config.providerId} onValueChange={(v) => setConfig({ ...config, providerId: v })} data-testid="select-provider">
              <SelectTrigger>
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((p) => (
                  <SelectItem key={p.id} value={p.id} disabled={!p.isActive}>
                    {p.name} {!p.isActive && <Badge variant="secondary" className="ml-2">Inactive</Badge>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              placeholder="sk-..."
              data-testid="input-api-key"
            />
            <p className="text-xs text-muted-foreground">
              Your API key is encrypted and stored securely
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              value={config.model}
              onChange={(e) => setConfig({ ...config, model: e.target.value })}
              placeholder="gpt-4"
              data-testid="input-model"
            />
          </div>

          <div className="space-y-2">
            <Label>Temperature: {config.temperature}</Label>
            <Slider
              value={[config.temperature]}
              onValueChange={([v]) => setConfig({ ...config, temperature: v })}
              min={0}
              max={1}
              step={0.1}
              data-testid="slider-temperature"
            />
            <p className="text-xs text-muted-foreground">
              Lower values = more focused, Higher values = more creative
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxTokens">Max Tokens</Label>
            <Input
              id="maxTokens"
              type="number"
              value={config.maxTokens}
              onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) })}
              min={100}
              max={4000}
              data-testid="input-max-tokens"
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={testConfig} variant="outline" disabled={testing || !config.providerId || !config.apiKey} data-testid="button-test-connection">
              {testing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
              Test Connection
            </Button>
            <Button onClick={() => saveConfig.mutate()} disabled={saveConfig.isPending || !config.providerId || !config.apiKey} data-testid="button-save-config">
              Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
