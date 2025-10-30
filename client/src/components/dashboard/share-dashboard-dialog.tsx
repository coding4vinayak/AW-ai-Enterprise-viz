
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Share2, Copy, Check, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ShareDashboardDialogProps {
  dashboardId: string;
  dashboardName: string;
}

export function ShareDashboardDialog({ dashboardId, dashboardName }: ShareDashboardDialogProps) {
  const [open, setOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [password, setPassword] = useState('');
  const [expiresIn, setExpiresIn] = useState('7');
  const [allowedEmails, setAllowedEmails] = useState('');
  const { toast } = useToast();

  const createShareLink = async () => {
    try {
      const response = await fetch(`/api/dashboards/${dashboardId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isPublic,
          password: password || null,
          expiresIn: expiresIn ? parseInt(expiresIn) * 24 * 60 * 60 : null,
          allowedEmails: allowedEmails ? allowedEmails.split(',').map(e => e.trim()) : null,
          permissions: { canEdit: false, canExport: true }
        }),
      });

      if (!response.ok) throw new Error('Failed to create share link');

      const data = await response.json();
      setShareUrl(data.shareUrl);
      
      toast({
        title: 'Share link created',
        description: 'Your dashboard share link is ready',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Copied!',
      description: 'Share link copied to clipboard',
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Dashboard</DialogTitle>
          <DialogDescription>
            Create a shareable link for "{dashboardName}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {shareUrl ? (
            <div className="space-y-2">
              <Label>Share URL</Label>
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly className="flex-1" />
                <Button size="icon" variant="outline" onClick={copyToClipboard}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              {password && (
                <Badge variant="secondary" className="gap-1">
                  <Lock className="h-3 w-3" />
                  Password Protected
                </Badge>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <Label htmlFor="public">Public Access</Label>
                <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expires">Expires In</Label>
                <Select value={expiresIn} onValueChange={setExpiresIn}>
                  <SelectTrigger id="expires">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Day</SelectItem>
                    <SelectItem value="7">7 Days</SelectItem>
                    <SelectItem value="30">30 Days</SelectItem>
                    <SelectItem value="0">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password (Optional)</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Set a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {!isPublic && (
                <div className="space-y-2">
                  <Label htmlFor="emails">Allowed Emails (comma-separated)</Label>
                  <Input
                    id="emails"
                    placeholder="user1@example.com, user2@example.com"
                    value={allowedEmails}
                    onChange={(e) => setAllowedEmails(e.target.value)}
                  />
                </div>
              )}

              <Button onClick={createShareLink} className="w-full">
                <Share2 className="h-4 w-4 mr-2" />
                Create Share Link
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
