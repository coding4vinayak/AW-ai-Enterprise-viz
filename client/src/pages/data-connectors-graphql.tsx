
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Code, Play, Plus } from "lucide-react";

export default function GraphQLConnector() {
  const [endpoint, setEndpoint] = useState("");
  const [query, setQuery] = useState("");
  const [headers, setHeaders] = useState("{}");
  const { toast } = useToast();

  const testQuery = async () => {
    toast({
      title: "Testing GraphQL query...",
      description: "Executing query against endpoint",
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-4 p-8 border-b border-border">
        <div>
          <h1 className="text-4xl font-bold mb-2">GraphQL Connector</h1>
          <p className="text-base text-muted-foreground">
            Configure GraphQL API connections
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                GraphQL Configuration
              </CardTitle>
              <CardDescription>Connect to any GraphQL API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="endpoint">Endpoint URL</Label>
                <Input
                  id="endpoint"
                  placeholder="https://api.example.com/graphql"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="headers">Headers (JSON)</Label>
                <Textarea
                  id="headers"
                  className="font-mono text-sm"
                  rows={3}
                  placeholder='{"Authorization": "Bearer YOUR_TOKEN"}'
                  value={headers}
                  onChange={(e) => setHeaders(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="query">GraphQL Query</Label>
                <Textarea
                  id="query"
                  className="font-mono text-sm"
                  rows={10}
                  placeholder={`query {
  users {
    id
    name
    email
    createdAt
  }
}`}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={testQuery} className="flex-1">
                  <Play className="h-4 w-4 mr-2" />
                  Test Query
                </Button>
                <Button className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  Save Connector
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
