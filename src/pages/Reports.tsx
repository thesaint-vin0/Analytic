import { useState, useCallback } from 'react';
import { Clock, Download, FileBarChart, Mail, Plus, Share2, Loader2, Trash2, Copy, Check, FileText } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { downloadFile, toCsv } from '../utils/format';
import { getKpis, getTimeSeries, getCategoryData, getRegionData, getTableData, getFunnelData, getGeoData } from '../services/mockData';

interface GeneratedReport {
  id: string;
  name: string;
  type: string;
  format: 'csv' | 'json';
  data: string;
  createdAt: string;
}

const reportTypes: { value: string; label: string; desc: string }[] = [
  { value: 'sales', label: 'Sales Report', desc: 'Revenue, orders, and growth by month' },
  { value: 'financial', label: 'Financial Summary', desc: 'Revenue, expenses, and profit breakdown' },
  { value: 'customers', label: 'Customer Report', desc: 'Customer table with revenue and status' },
  { value: 'marketing', label: 'Marketing Funnel', desc: 'Conversion funnel and channel data' },
  { value: 'geographic', label: 'Geographic Report', desc: 'Revenue and users by region' },
  { value: 'full', label: 'Full Dashboard Export', desc: 'All KPIs, time series, categories, and table data' },
];

function buildReport(type: string, format: 'csv' | 'json'): string {
  const kpis = getKpis();
  const ts = getTimeSeries();
  const cats = getCategoryData();
  const regions = getRegionData();
  const table = getTableData();
  const funnel = getFunnelData();
  const geo = getGeoData();

  if (format === 'json') {
    const payload: Record<string, unknown> = { generatedAt: new Date().toISOString(), type };
    switch (type) {
      case 'sales':
        payload.kpis = kpis.filter((k) => ['revenue', 'orders', 'users'].includes(k.id));
        payload.timeSeries = ts.map((t) => ({ date: t.date, revenue: t.revenue, orders: t.orders, users: t.users }));
        break;
      case 'financial':
        payload.kpis = kpis.filter((k) => ['revenue', 'expenses', 'profit'].includes(k.id));
        payload.timeSeries = ts.map((t) => ({ date: t.date, revenue: t.revenue, expenses: t.expenses, profit: t.profit }));
        break;
      case 'customers':
        payload.customers = table;
        break;
      case 'marketing':
        payload.funnel = funnel;
        payload.categories = cats;
        break;
      case 'geographic':
        payload.regions = geo;
        payload.regionBreakdown = regions;
        break;
      case 'full':
      default:
        payload.kpis = kpis;
        payload.timeSeries = ts;
        payload.categories = cats;
        payload.regions = regions;
        payload.customers = table;
        payload.funnel = funnel;
        payload.geo = geo;
        break;
    }
    return JSON.stringify(payload, null, 2);
  }

  // CSV format
  switch (type) {
    case 'sales':
      return toCsv(ts.map((t) => ({ date: t.date, revenue: t.revenue, orders: t.orders, users: t.users })));
    case 'financial':
      return toCsv(ts.map((t) => ({ date: t.date, revenue: t.revenue, expenses: t.expenses, profit: t.profit })));
    case 'customers':
      return toCsv(table as unknown as Record<string, unknown>[]);
    case 'marketing':
      return toCsv(funnel as unknown as Record<string, unknown>[]);
    case 'geographic':
      return toCsv(geo as unknown as Record<string, unknown>[]);
    case 'full':
    default: {
      const sections = [
        '# KPIs',
        toCsv(kpis as unknown as Record<string, unknown>[]),
        '',
        '# Time Series',
        toCsv(ts as unknown as Record<string, unknown>[]),
        '',
        '# Categories',
        toCsv(cats as unknown as Record<string, unknown>[]),
        '',
        '# Customers',
        toCsv(table as unknown as Record<string, unknown>[]),
        '',
        '# Funnel',
        toCsv(funnel as unknown as Record<string, unknown>[]),
        '',
        '# Geographic',
        toCsv(geo as unknown as Record<string, unknown>[]),
      ];
      return sections.join('\n');
    }
  }
}

export function Reports() {
  const [open, setOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState<GeneratedReport | null>(null);
  const [type, setType] = useState('sales');
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [generating, setGenerating] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [shareSent, setShareSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    setGenerating(true);
    setTimeout(() => {
      const reportType = reportTypes.find((r) => r.value === type);
      const data = buildReport(type, format);
      const report: GeneratedReport = {
        id: `rpt-${Date.now()}`,
        name: reportType?.label ?? 'Report',
        type,
        format,
        data,
        createdAt: new Date().toISOString(),
      };
      setReports((prev) => [report, ...prev]);
      setGenerating(false);
      setOpen(false);
    }, 600);
  }, [type, format]);

  const download = (report: GeneratedReport) => {
    const filename = `${report.name.toLowerCase().replace(/\s+/g, '-')}-${new Date(report.createdAt).toISOString().split('T')[0]}.${report.format}`;
    downloadFile(filename, report.data, report.format === 'csv' ? 'text/csv' : 'application/json');
  };

  const remove = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  const copyShareLink = (report: GeneratedReport) => {
    const blob = new Blob([report.data], { type: report.format === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    });
  };

  const sendShare = () => {
    if (!shareEmail) return;
    setShareSent(true);
    setTimeout(() => {
      setShareSent(false);
      setShareOpen(null);
      setShareEmail('');
      setShareMessage('');
    }, 1500);
  };

  const formatTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Generate, download, and share analytics reports from your dashboard data."
        action={<Button size="sm" onClick={() => setOpen(true)}><Plus size={14} /> New Report</Button>}
      />

      {reports.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FileText size={32} className="mx-auto text-muted mb-3" />
            <p className="text-sm font-medium">No reports generated yet</p>
            <p className="text-xs text-muted mt-1 mb-4">Generate a report from your dashboard data to get started.</p>
            <Button size="sm" onClick={() => setOpen(true)}><Plus size={14} /> Generate Report</Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((r) => {
            const rt = reportTypes.find((t) => t.value === r.type);
            return (
              <Card key={r.id} hover>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/40 text-primary flex items-center justify-center">
                    <FileBarChart size={18} />
                  </div>
                  <Badge tone="success">Ready</Badge>
                </div>
                <h3 className="text-sm font-semibold mb-1">{r.name}</h3>
                <p className="text-xs text-muted mb-3 line-clamp-2">{rt?.desc}</p>
                <div className="flex items-center gap-3 text-xs text-muted mb-4">
                  <span className="flex items-center gap-1"><Clock size={12} /> {formatTime(r.createdAt)}</span>
                  <span className="uppercase">{r.format}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => download(r)}><Download size={13} /> Download</Button>
                  <Button variant="ghost" size="sm" onClick={() => setShareOpen(r)}><Share2 size={13} /> Share</Button>
                  <Button variant="ghost" size="sm" onClick={() => remove(r.id)}><Trash2 size={13} /></Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <h3 className="text-sm font-semibold mb-3">Available Report Types</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {reportTypes.map((rt) => (
            <div key={rt.value} className="p-3 surface-2 rounded-lg border border-border">
              <p className="text-sm font-medium">{rt.label}</p>
              <p className="text-xs text-muted mt-0.5">{rt.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Generate New Report">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted block mb-1.5">Report Type</label>
            <div className="space-y-2 max-h-52 overflow-y-auto">
              {reportTypes.map((rt) => (
                <button
                  key={rt.value}
                  onClick={() => setType(rt.value)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition ${type === rt.value ? 'border-primary bg-primary/5' : 'border-border hover:border-slate-300'}`}
                >
                  <p className="text-sm font-medium">{rt.label}</p>
                  <p className="text-xs text-muted">{rt.desc}</p>
                </button>
              ))}
            </div>
          </div>
          <Select label="Format" value={format} onChange={(v) => setFormat(v as 'csv' | 'json')} options={[
            { label: 'CSV (spreadsheet)', value: 'csv' },
            { label: 'JSON (structured)', value: 'json' },
          ]} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={generate} disabled={generating}>
              {generating ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              {generating ? 'Generating...' : 'Generate'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!shareOpen} onClose={() => { setShareOpen(null); setShareSent(false); }} title="Share Report">
        {shareOpen && (
          <div className="space-y-4">
            <div className="p-3 surface-2 rounded-lg">
              <p className="text-sm font-medium">{shareOpen.name}</p>
              <p className="text-xs text-muted">{shareOpen.format.toUpperCase()} · {formatTime(shareOpen.createdAt)}</p>
            </div>

            <div>
              <label className="text-xs text-muted block mb-1.5">Copy Link</label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => copyShareLink(shareOpen)} className="flex-1">
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy Share Link'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => download(shareOpen)}>
                  <Download size={14} /> Download
                </Button>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-xs text-muted mb-3">Or send via email</p>
              <div className="space-y-3">
                <Input label="Recipient Email" type="email" value={shareEmail} onChange={setShareEmail} placeholder="colleague@company.com" />
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted">Message (optional)</span>
                  <textarea
                    value={shareMessage}
                    onChange={(e) => setShareMessage(e.target.value)}
                    rows={2}
                    placeholder="Check out this report..."
                    className="surface-2 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  />
                </label>
                <Button size="sm" onClick={sendShare} disabled={!shareEmail || shareSent} className="w-full">
                  {shareSent ? <Check size={14} /> : <Mail size={14} />}
                  {shareSent ? 'Sent!' : 'Send Report'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
