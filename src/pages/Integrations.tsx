import { useState } from 'react';
import { Check, Database, FileSpreadsheet, Globe, Key, Plug, Plus, Webhook, X } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

interface Integration {
  id: string;
  name: string;
  type: 'database' | 'api' | 'file' | 'webhook';
  icon: typeof Database;
  connected: boolean;
  description: string;
}

const integrations: Integration[] = [
  { id: 'supabase', name: 'Supabase', type: 'database', icon: Database, connected: true, description: 'PostgreSQL database with real-time subscriptions.' },
  { id: 'postgres', name: 'PostgreSQL', type: 'database', icon: Database, connected: false, description: 'Direct connection to any PostgreSQL instance.' },
  { id: 'mysql', name: 'MySQL', type: 'database', icon: Database, connected: false, description: 'Connect to MySQL databases.' },
  { id: 'mongodb', name: 'MongoDB', type: 'database', icon: Database, connected: false, description: 'NoSQL document database integration.' },
  { id: 'firebase', name: 'Firebase', type: 'database', icon: Database, connected: false, description: 'Realtime database and Firestore.' },
  { id: 'rest', name: 'REST API', type: 'api', icon: Globe, connected: false, description: 'Connect any REST API endpoint.' },
  { id: 'graphql', name: 'GraphQL API', type: 'api', icon: Globe, connected: false, description: 'Query GraphQL APIs with typed schemas.' },
  { id: 'csv', name: 'CSV Import', type: 'file', icon: FileSpreadsheet, connected: false, description: 'Upload and visualize CSV files.' },
  { id: 'excel', name: 'Excel Import', type: 'file', icon: FileSpreadsheet, connected: false, description: 'Import .xlsx spreadsheets.' },
  { id: 'sheets', name: 'Google Sheets', type: 'file', icon: FileSpreadsheet, connected: false, description: 'Sync live Google Sheets data.' },
  { id: 'webhook', name: 'Webhooks', type: 'webhook', icon: Webhook, connected: false, description: 'Receive real-time data via webhooks.' },
];

const typeColor: Record<Integration['type'], string> = {
  database: '#10b981',
  api: '#0ea5e9',
  file: '#f59e0b',
  webhook: '#8b5cf6',
};

export function Integrations() {
  const [state, setState] = useState(integrations);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Integration | null>(null);

  const toggle = (id: string) => {
    setState((prev) => prev.map((i) => (i.id === id ? { ...i, connected: !i.connected } : i)));
    setOpen(false);
  };

  const openConfig = (int: Integration) => {
    setActive(int);
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Integrations" subtitle="Connect databases, APIs, files, and webhooks." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.map((int) => {
          const Icon = int.icon;
          return (
            <Card key={int.id} hover>
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${typeColor[int.type]}1a`, color: typeColor[int.type] }}>
                  <Icon size={20} />
                </div>
                {int.connected ? <Badge tone="success"><Check size={11} className="mr-0.5" /> Connected</Badge> : <Badge tone="default">Available</Badge>}
              </div>
              <h3 className="text-sm font-semibold">{int.name}</h3>
              <p className="text-xs text-muted mt-1 mb-4 leading-relaxed">{int.description}</p>
              <Button
                variant={int.connected ? 'outline' : 'primary'}
                size="sm"
                onClick={() => (int.connected ? toggle(int.id) : openConfig(int))}
                className="w-full"
              >
                {int.connected ? <><X size={13} /> Disconnect</> : <><Plus size={13} /> Connect</>}
              </Button>
            </Card>
          );
        })}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={`Connect ${active?.name ?? ''}`}>
        {active && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 surface-2 rounded-lg">
              <Plug size={18} className="text-primary" />
              <p className="text-xs text-muted">{active.description}</p>
            </div>
            {active.type === 'database' && (
              <>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted">Connection URL</span>
                  <input placeholder="postgresql://user:pass@host:5432/db" className="surface-2 border border-border rounded-lg px-3 py-2 text-sm" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted">Database Name</span>
                  <input placeholder="analytics" className="surface-2 border border-border rounded-lg px-3 py-2 text-sm" />
                </label>
              </>
            )}
            {active.type === 'api' && (
              <>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted">Endpoint URL</span>
                  <input placeholder="https://api.example.com/v1" className="surface-2 border border-border rounded-lg px-3 py-2 text-sm" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted">API Key</span>
                  <input type="password" placeholder="••••••••" className="surface-2 border border-border rounded-lg px-3 py-2 text-sm" />
                </label>
              </>
            )}
            {active.type === 'file' && (
              <label className="flex flex-col gap-1">
                <span className="text-xs text-muted">Upload File</span>
                <input type="file" className="surface-2 border border-border rounded-lg px-3 py-2 text-sm" />
              </label>
            )}
            {active.type === 'webhook' && (
              <div className="p-3 surface-2 rounded-lg">
                <p className="text-xs text-muted mb-2">Webhook URL:</p>
                <code className="text-xs text-primary">https://api.pulse.io/webhook/{active.id}</code>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={() => active && toggle(active.id)}><Key size={14} /> Connect</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
