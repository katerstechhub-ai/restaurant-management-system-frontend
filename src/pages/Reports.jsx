import { useState } from 'react';
import { FileDown, Download } from 'lucide-react';
import { generateReport } from '../api/rufus';
import { colors, font } from '../styles/tokens';
import AdminLayout from '../components/AdminLayout';
import { Card, Select, Input, Button, PageTitle, ErrorText } from '../components/ui';

// Report types line up with the aggregate endpoints described in the task
// breakdown (sales trends, menu popularity, revenue by period, customer
// demographics). If Rufus's backend ends up using different `type` values,
// only this list needs to change.
const REPORT_TYPES = [
  { value: 'sales-trends', label: 'Sales Trends' },
  { value: 'menu-popularity', label: 'Menu Popularity' },
  { value: 'revenue-by-period', label: 'Revenue by Period' },
  { value: 'customer-demographics', label: 'Customer Demographics' },
];

function defaultFrom() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
}
function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function Reports() {
  const [type, setType] = useState(REPORT_TYPES[0].value);
  const [from, setFrom] = useState(defaultFrom());
  const [to, setTo] = useState(today());
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [lastGenerated, setLastGenerated] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setGenerating(true);
    try {
      const blob = await generateReport(type, from, to);
      const url = URL.createObjectURL(blob);
      const label = REPORT_TYPES.find((r) => r.value === type)?.label || type;
      const filename = `${type}_${from}_to_${to}.pdf`;

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      setLastGenerated({ label, from, to, at: new Date() });
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <AdminLayout title="Reports">
      <PageTitle subtitle="Select a report type and date range, then export">
        Reports
      </PageTitle>

      <ErrorText>{error}</ErrorText>

      <Card style={{ maxWidth: '620px' }}>
        <form onSubmit={handleGenerate} style={{ display: 'grid', gap: '16px' }}>
          <Select label="Report type" value={type} onChange={(e) => setType(e.target.value)}>
            {REPORT_TYPES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </Select>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label="From"
              type="date"
              value={from}
              max={to}
              onChange={(e) => setFrom(e.target.value)}
              required
            />
            <Input
              label="To"
              type="date"
              value={to}
              min={from}
              max={today()}
              onChange={(e) => setTo(e.target.value)}
              required
            />
          </div>

          <div>
            <Button type="submit" disabled={generating}>
              <Download size={15} />
              {generating ? 'Generating…' : 'Generate & Download'}
            </Button>
          </div>
        </form>

        {lastGenerated && (
          <div
            style={{
              marginTop: '18px',
              paddingTop: '16px',
              borderTop: `1px solid ${colors.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: colors.textMuted,
              fontSize: '12px',
            }}
          >
            <FileDown size={14} />
            <span>
              <strong style={{ color: colors.text, fontFamily: font.body }}>{lastGenerated.label}</strong>
              {' '}({lastGenerated.from} → {lastGenerated.to}) downloaded at{' '}
              {lastGenerated.at.toLocaleTimeString()}
            </span>
          </div>
        )}
      </Card>
    </AdminLayout>
  );
}