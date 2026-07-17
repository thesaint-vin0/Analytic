import { useState } from 'react';
import { Calendar, Clock, Download, FileBarChart, Mail, Plus, Share2 } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { downloadFile, toCsv } from '../utils/format';
import { getKpis, getTimeSeries } from '../services/mockData';

const reportTemplates = [
  { id: 'daily', name: 'Daily Sales Report', frequency: 'Daily', lastRun: '2h ago', status: 'ready' },
  { id: 'weekly', name: 'Weekly Financial Summary', frequency: 'Weekly', lastRun: '1d ago', status: 'ready' },
  { id: 'monthly', name: 'Monthly Performance Review', frequency: 'Monthly', lastRun: '3d ago', status: 'ready' },
  { id: 'quarterly', name: 'Q3 Executive Report', frequency: 'Quarterly', lastRun: '12d ago', status: 'scheduled' },
  { id: 'custom1', name: 'Marketing Campaign Analysis', frequency: 'Custom', lastRun: '5d ago', status: 'ready' },
];

export function Reports() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('daily');
  const [format, setFormat] = useState('csv');

  const generate = () => {
    const kpis = getKpis();
    const ts = getTimeSeries();
    const data = format === 'csv' ? toCsv(ts as unknown as Record<string, unknown>[]) : JSON.stringify({ kpis, ts }, null, 2);
    downloadFile(`report-${type}.${format}`, data, format === 'csv' ? 'text/csv' : 'application/json');
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Generate, schedule, and share analytics reports."
        action={<Button size="sm" onClick={() => setOpen(true)}><Plus size={14} /> New Report</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTemplates.map((r) => (
          <Card key={r.id} hover>
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/40 text-primary flex items-center justify-center">
                <FileBarChart size={18} />
              </div>
              <Badge tone={r.status === 'ready' ? 'success' : 'info'}>{r.status}</Badge>
            </div>
            <h3 className="text-sm font-semibold mb-1">{r.name}</h3>
            <div className="flex items-center gap-3 text-xs text-muted mb-4">
              <span className="flex items-center gap-1"><Clock size={12} /> {r.frequency}</span>
              <span className="flex items-center gap-1"><Calendar size={12} /> {r.lastRun}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm"><Download size={13} /> Download</Button>
              <Button variant="ghost" size="sm"><Share2 size={13} /> Share</Button>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="text-sm font-semibold mb-3">Scheduled Reports</h3>
        <div className="space-y-2">
          {reportTemplates.filter((r) => r.status === 'scheduled' || r.frequency !== 'Custom').map((r) => (
            <div key={r.id} className="flex items-center justify-between p-3 surface-2 rounded-lg">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-primary" />
                <div>
                  <p className="text-sm font-medium">{r.name}</p>
                  <p className="text-xs text-muted">Delivered to: team@company.com · {r.frequency}</p>
                </div>
              </div>
              <Badge tone="info">Active</Badge>
            </div>
          ))}
        </div>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Generate New Report">
        <div className="space-y-4">
          <Select label="Report Type" value={type} onChange={setType} options={[
            { label: 'Daily', value: 'daily' },
            { label: 'Weekly', value: 'weekly' },
            { label: 'Monthly', value: 'monthly' },
            { label: 'Quarterly', value: 'quarterly' },
            { label: 'Yearly', value: 'yearly' },
          ]} />
          <Select label="Format" value={format} onChange={setFormat} options={[
            { label: 'CSV', value: 'csv' },
            { label: 'JSON', value: 'json' },
          ]} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={generate}><Download size={14} /> Generate</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
