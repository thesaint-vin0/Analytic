import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Download, FileText, Printer, Search } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { getTableData } from '../services/mockData';
import type { TableRow } from '../types/analytics';
import { downloadFile, toCsv } from '../utils/format';
import { clsx } from '../utils/clsx';

type SortKey = keyof TableRow | '';
type SortDir = 'asc' | 'desc';

const statusTone: Record<TableRow['status'], 'success' | 'warning' | 'default' | 'error'> = {
  active: 'success',
  pending: 'warning',
  inactive: 'default',
  churned: 'error',
};

const columns: { key: keyof TableRow; label: string; sortable?: boolean; align?: 'right' }[] = [
  { key: 'name', label: 'Customer' },
  { key: 'category', label: 'Category' },
  { key: 'region', label: 'Region' },
  { key: 'status', label: 'Status' },
  { key: 'revenue', label: 'Revenue', sortable: true, align: 'right' },
  { key: 'orders', label: 'Orders', sortable: true, align: 'right' },
  { key: 'growth', label: 'Growth', sortable: true, align: 'right' },
  { key: 'lastActive', label: 'Last Active', sortable: true },
];

export function DataExplorer() {
  const rows = useMemo(() => getTableData(47), []);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [visibleCols, setVisibleCols] = useState<Set<keyof TableRow>>(new Set(columns.map((c) => c.key)));

  const filtered = useMemo(() => {
    let r = rows;
    if (search) {
      const q = search.toLowerCase();
      r = r.filter((row) => row.name.toLowerCase().includes(q) || row.category.toLowerCase().includes(q) || row.region.toLowerCase().includes(q) || row.status.includes(q));
    }
    if (sortKey) {
      r = [...r].sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
        return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
      });
    }
    return r;
  }, [rows, search, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (key: keyof TableRow) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === pageRows.length) setSelected(new Set());
    else setSelected(new Set(pageRows.map((r) => r.id)));
  };

  const toggleCol = (key: keyof TableRow) => {
    setVisibleCols((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const exportCsv = () => downloadFile('data-export.csv', toCsv(filtered as unknown as Record<string, unknown>[]), 'text/csv');
  const exportJson = () => downloadFile('data-export.json', JSON.stringify(filtered, null, 2), 'application/json');
  const print = () => window.print();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Explorer"
        subtitle="Search, sort, filter, and export your records."
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCsv}><Download size={14} /> CSV</Button>
            <Button variant="outline" size="sm" onClick={exportJson}><FileText size={14} /> JSON</Button>
            <Button variant="outline" size="sm" onClick={print}><Printer size={14} /> Print</Button>
          </div>
        }
      />

      <div className="surface rounded-2xl overflow-hidden">
        <div className="p-4 flex flex-wrap items-center gap-3 border-b border-border">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search customers, categories, regions..."
              className="w-full pl-9 pr-3 py-2 text-sm surface-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <Select
            value={String(pageSize)}
            onChange={(v) => { setPageSize(Number(v)); setPage(1); }}
            options={[5, 10, 20, 50].map((n) => ({ label: `${n} / page`, value: String(n) }))}
          />
          <div className="relative group">
            <Button variant="outline" size="sm">Columns</Button>
            <div className="absolute right-0 mt-2 w-44 surface rounded-lg shadow-xl border border-border z-20 hidden group-hover:block p-2">
              {columns.map((c) => (
                <label key={c.key} className="flex items-center gap-2 px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer">
                  <input type="checkbox" checked={visibleCols.has(c.key)} onChange={() => toggleCol(c.key)} />
                  {c.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        {selected.size > 0 && (
          <div className="px-4 py-2 bg-sky-50 dark:bg-sky-900/20 border-b border-border flex items-center justify-between text-xs">
            <span>{selected.size} selected</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>Clear</Button>
              <Button variant="danger" size="sm">Delete Selected</Button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="p-3 w-10">
                  <input type="checkbox" checked={selected.size === pageRows.length && pageRows.length > 0} onChange={toggleSelectAll} />
                </th>
                {columns.filter((c) => visibleCols.has(c.key)).map((c) => (
                  <th key={c.key} className={clsx('p-3 text-left font-semibold text-xs text-muted', c.align === 'right' && 'text-right')}>
                    {c.sortable ? (
                      <button onClick={() => toggleSort(c.key)} className="inline-flex items-center gap-1 hover:text-primary transition">
                        {c.label}
                        {sortKey === c.key && (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                      </button>
                    ) : (
                      c.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row) => (
                <tr key={row.id} className="border-b border-border hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="p-3">
                    <input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleSelect(row.id)} />
                  </td>
                  {columns.filter((c) => visibleCols.has(c.key)).map((c) => {
                    const val = row[c.key];
                    if (c.key === 'status') return <td key={c.key} className="p-3"><Badge tone={statusTone[row.status]}>{row.status}</Badge></td>;
                    if (c.key === 'revenue') return <td key={c.key} className="p-3 text-right font-medium">${row.revenue.toLocaleString()}</td>;
                    if (c.key === 'orders') return <td key={c.key} className="p-3 text-right">{row.orders}</td>;
                    if (c.key === 'growth') return <td key={c.key} className={clsx('p-3 text-right font-medium', row.growth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>{row.growth >= 0 ? '+' : ''}{row.growth}%</td>;
                    return <td key={c.key} className="p-3">{String(val)}</td>;
                  })}
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr><td colSpan={columns.length + 1} className="p-8 text-center text-muted text-sm">No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 flex items-center justify-between text-xs">
          <span className="text-muted">
            Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft size={14} />
            </Button>
            <span className="px-2">{page} / {totalPages || 1}</span>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
