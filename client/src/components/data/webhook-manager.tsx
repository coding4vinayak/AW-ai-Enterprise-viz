
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Webhook, Copy, Check, Trash2, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface WebhookManagerProps {
  datasetId: string;
  datasetName: string;
}

interface WebhookItem {
  id: string;
  name: string;
  url: string;
  secret: string;
  isActive: boolean;
}

export function WebhookManager({ datasetId, datasetName }: WebhookManagerProps) {
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([]);
  const [name, setName] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const createWebhook = async () => {
    try {
      const response = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || `${datasetName} Webhook`,
          datasetId,
        }),
      });

      if (!response.ok) throw new Error('Failed to create webhook');

      const webhook = await response.json();
      setWebhooks([...webhooks, webhook]);
      
      toast({
        title: 'Webhook created',
        description: 'Your webhook endpoint is ready to receive data',
      });
      
      setOpen(false);
      setName('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast({
      title: 'Copied!',
      description: 'Webhook URL copied to clipboard',
    });
  };

  const deleteWebhook = async (id: string) => {
    try {
      const response = await fetch(`/api/webhooks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete webhook');

      setWebhooks(webhooks.filter(w => w.id !== id));
      
      toast({
        title: 'Webhook deleted',
        description: 'The webhook has been removed',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Webhooks</h3>
          <p className="text-sm text-muted-foreground">
            Receive real-time data via HTTP endpoints
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Webhook
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Webhook</DialogTitle>
              <DialogDescription>
                Create a new webhook endpoint for "{datasetName}"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-name">Webhook Name</Label>
                <Input
                  id="webhook-name"
                  placeholder="Production Data Ingestion"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <Button onClick={createWebhook} className="w-full">
                Create Webhook
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {webhooks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Webhook className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">No webhooks configured</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {webhooks.map((webhook) => (
            <Card key={webhook.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{webhook.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={webhook.isActive ? "default" : "secondary"}>
                      {webhook.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteWebhook(webhook.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Endpoint URL</Label>
                  <div className="flex gap-2">
                    <Input
                      value={webhook.url}
                      readOnly
                      className="text-xs font-mono"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => copyToClipboard(webhook.url, webhook.id)}
                    >
                      {copied === webhook.id ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Secret Key</Label>
                  <div className="flex gap-2">
                    <Input
                      value={webhook.secret}
                      readOnly
                      type="password"
                      className="text-xs font-mono"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => copyToClipboard(webhook.secret, `${webhook.id}-secret`)}
                    >
                      {copied === `${webhook.id}-secret` ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
