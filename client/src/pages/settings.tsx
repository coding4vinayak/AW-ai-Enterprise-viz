import { Key, Database as DatabaseIcon, Bell, User, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [apiKey, setApiKey] = useState("");
  const { toast } = useToast();

  const handleSaveApiKey = () => {
    toast({
      title: "API Key Saved",
      description: "OpenAI API key has been configured successfully.",
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <div className="flex flex-col gap-4 p-8 border-b border-border">
        <div>
          <h1 className="text-4xl font-bold mb-2">Settings</h1>
          <p className="text-base text-muted-foreground">
            Manage your account and application preferences
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* AI Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                <CardTitle>AI Configuration</CardTitle>
              </div>
              <CardDescription>
                Configure OpenAI API key for AI-powered insights and chat assistant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">OpenAI API Key</Label>
                <div className="flex gap-3">
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="sk-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    data-testid="input-api-key"
                    className="font-mono"
                  />
                  <Button
                    onClick={handleSaveApiKey}
                    data-testid="button-save-api-key"
                  >
                    Save
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Get your API key from{" "}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    OpenAI Platform
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <CardTitle>Profile Settings</CardTitle>
              </div>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="admin"
                  data-testid="input-username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  data-testid="input-email"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <CardTitle>Notifications</CardTitle>
              </div>
              <CardDescription>Configure alert preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Anomaly Detection Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications when anomalies are detected
                  </p>
                </div>
                <Switch data-testid="switch-anomaly-alerts" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Daily Summary</Label>
                  <p className="text-sm text-muted-foreground">
                    Get daily insights summary via email
                  </p>
                </div>
                <Switch data-testid="switch-daily-summary" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Data Upload Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Alerts when new data is uploaded
                  </p>
                </div>
                <Switch defaultChecked data-testid="switch-upload-notifications" />
              </div>
            </CardContent>
          </Card>

          {/* Data & Privacy */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <CardTitle>Data & Privacy</CardTitle>
              </div>
              <CardDescription>Manage your data and privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Data Retention</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically delete old datasets after 90 days
                  </p>
                </div>
                <Switch data-testid="switch-data-retention" />
              </div>
              <Separator />
              <Button variant="destructive" data-testid="button-delete-all-data">
                <DatabaseIcon className="h-4 w-4" />
                Delete All Data
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
