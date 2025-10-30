
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Mail, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EmailReportsDialogProps {
  dashboardId: string;
  dashboardName: string;
}

export function EmailReportsDialog({ dashboardId, dashboardName }: EmailReportsDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [recipients, setRecipients] = useState('');
  const [schedule, setSchedule] = useState('daily');
  const [format, setFormat] = useState('pdf');
  const { toast } = useToast();

  const scheduleOptions = {
    daily: '0 8 * * *',
    weekly: '0 8 * * 1',
    monthly: '0 8 1 * *',
  };

  const createEmailReport = async () => {
    try {
      const response = await fetch('/api/email-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dashboardId,
          name: name || `${dashboardName} Report`,
          recipients: recipients.split(',').map(e => e.trim()),
          schedule: scheduleOptions[schedule as keyof typeof scheduleOptions],
          format,
        }),
      });

      if (!response.ok) throw new Error('Failed to create email report');

      toast({
        title: 'Email report scheduled',
        description: `Report will be sent ${schedule}`,
      });
      
      setOpen(false);
      setName('');
      setRecipients('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const sendTestEmail = async () => {
    try {
      toast({
        title: 'Sending test email...',
        description: 'Please wait',
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Mail className="h-4 w-4 mr-2" />
          Email Reports
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Email Reports</DialogTitle>
          <DialogDescription>
            Automatically send "{dashboardName}" via email
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="report-name">Report Name</Label>
            <Input
              id="report-name"
              placeholder={`${dashboardName} Report`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipients">Recipients (comma-separated)</Label>
            <Input
              id="recipients"
              placeholder="user1@example.com, user2@example.com"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule">Schedule</Label>
            <Select value={schedule} onValueChange={setSchedule}>
              <SelectTrigger id="schedule">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily (8:00 AM)</SelectItem>
                <SelectItem value="weekly">Weekly (Monday 8:00 AM)</SelectItem>
                <SelectItem value="monthly">Monthly (1st day, 8:00 AM)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="format">Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger id="format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="png">PNG Image</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button onClick={createEmailReport} className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Report
            </Button>
            <Button variant="outline" onClick={sendTestEmail}>
              Send Test
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
