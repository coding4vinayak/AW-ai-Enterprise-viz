
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Link as LinkIcon, CheckCircle, XCircle } from "lucide-react";

export default function DataConnectors() {
  const [connectorType, setConnectorType] = useState("rest");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [authType, setAuthType] = useState("bearer");
  const [apiKey, setApiKey] = useState("");
  const { toast } = useToast();

  const testConnection = async () => {
    toast({
      title: "Testing connection...",
      description: "Please wait while we verify the connection",
    });
  };

  const createConnector = async () => {
    toast({
      title: "Connector created",
      description: "Your data connector has been set up successfully",
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-4 p-8 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">API Connectors</h1>
            <p className="text-base text-muted-foreground">
              Connect to external APIs and databases
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Tabs defaultValue="rest" value={connectorType} onValueChange={setConnectorType}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="rest">REST API</TabsTrigger>
              <TabsTrigger value="graphql">GraphQL</TabsTrigger>
              <TabsTrigger value="database">Database</TabsTrigger>
            </TabsList>

            <TabsContent value="rest" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>REST API Configuration</CardTitle>
                  <CardDescription>Connect to any REST API endpoint</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="rest-name">Connection Name</Label>
                    <Input
                      id="rest-name"
                      placeholder="My API Connection"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rest-url">API URL</Label>
                    <Input
                      id="rest-url"
                      placeholder="https://api.example.com/data"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="auth-type">Authentication</Label>
                    <Select value={authType} onValueChange={setAuthType}>
                      <SelectTrigger id="auth-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bearer">Bearer Token</SelectItem>
                        <SelectItem value="api_key">API Key</SelectItem>
                        <SelectItem value="basic">Basic Auth</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {authType !== "none" && (
                    <div className="space-y-2">
                      <Label htmlFor="api-key">
                        {authType === "bearer" ? "Bearer Token" : "API Key"}
                      </Label>
                      <Input
                        id="api-key"
                        type="password"
                        placeholder="Enter your token or key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={testConnection} className="flex-1">
                      Test Connection
                    </Button>
                    <Button onClick={createConnector} className="flex-1">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Connector
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="graphql" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>GraphQL Configuration</CardTitle>
                  <CardDescription>Connect to GraphQL endpoints</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Endpoint URL</Label>
                    <Input placeholder="https://api.example.com/graphql" />
                  </div>
                  <div className="space-y-2">
                    <Label>Query</Label>
                    <textarea
                      className="w-full min-h-32 p-3 rounded-lg border"
                      placeholder="query { users { id name email } }"
                    />
                  </div>
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create GraphQL Connector
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="database" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Database Configuration</CardTitle>
                  <CardDescription>Connect to PostgreSQL, MySQL, or MongoDB</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Database Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select database type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="postgresql">PostgreSQL</SelectItem>
                        <SelectItem value="mysql">MySQL</SelectItem>
                        <SelectItem value="mongodb">MongoDB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Connection String</Label>
                    <Input
                      type="password"
                      placeholder="postgresql://user:password@host:5432/database"
                    />
                  </div>
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Database Connection
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Active Connectors */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Active Connectors</h2>
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <LinkIcon className="h-5 w-5" />
                      <div>
                        <CardTitle className="text-lg">Sales API</CardTitle>
                        <CardDescription>https://api.sales.com/v1/data</CardDescription>
                      </div>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
