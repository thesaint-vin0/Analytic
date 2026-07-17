import { useMemo } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, LineChart } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { ChartCard } from '../components/ChartCard';
import { Badge } from '../components/ui/Badge';
import { LineChart as LineChartComp } from '../components/charts/LineChart';
import { getAiInsights, getTimeSeries } from '../services/mockData';

const iconMap = {
  trend: TrendingUp,
  forecast: LineChart,
  anomaly: AlertTriangle,
  recommendation: Lightbulb,
};

const toneMap = {
  trend: 'success',
  forecast: 'info',
  anomaly: 'error',
  recommendation: 'warning',
} as const;

export function AiInsights() {
  const insights = useMemo(() => getAiInsights(), []);
  const ts = useMemo(() => getTimeSeries(), []);

  const forecast = ts.map((d, i) => ({
    date: d.date,
    actual: i < 8 ? d.revenue : undefined,
    predicted: i >= 8 ? Math.round(d.revenue * (1 + 0.08 * (i - 7))) : Math.round(d.revenue * 0.95),
    lower: i >= 8 ? Math.round(d.revenue * (1 + 0.04 * (i - 7))) : undefined,
    upper: i >= 8 ? Math.round(d.revenue * (1 + 0.12 * (i - 7))) : undefined,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="AI Insights" subtitle="Trend detection, forecasting, anomaly detection, and recommendations." />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((ins, i) => {
          const Icon = iconMap[ins.type];
          return (
            <div key={i} className="surface rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold">{ins.title}</h3>
                    <Badge tone={toneMap[ins.type]}>{ins.type}</Badge>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">{ins.detail}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ChartCard title="Revenue Forecast" subtitle="Actual vs predicted (next quarter)">
        <LineChartComp
          data={forecast}
          xKey="date"
          series={[
            { key: 'actual', name: 'Actual', color: '#0ea5e9' },
            { key: 'predicted', name: 'Predicted', color: '#8b5cf6' },
            { key: 'upper', name: 'Upper bound', color: '#10b981' },
            { key: 'lower', name: 'Lower bound', color: '#ef4444' },
          ]}
          height={320}
        />
      </ChartCard>

      <div className="surface rounded-2xl p-5 flex items-center gap-3">
        <Sparkles size={20} className="text-primary shrink-0" />
        <p className="text-sm text-muted">
          Insights are generated from your connected data sources. Connect a live database or API to enable real-time AI analysis.
        </p>
      </div>
    </div>
  );
}
