import { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, UtensilsCrossed, Users } from 'lucide-react';
import { getSalesTrends, getTopDishes, getCustomerSegments } from '../api/rufus';
import { colors, font, radius } from '../styles/tokens';
import AdminLayout from '../components/AdminLayout';
import { Card, PageTitle, ErrorText } from '../components/ui';

// Matches the segment coloring used on the Customer Profiles (staff) page —
// keep these two in sync if segment tiers ever change.
const SEGMENT_COLOR = { new: '#3498db', regular: '#f5a623', vip: '#4caf50' };

// Backend response shapes for these three endpoints aren't fully locked
// down yet — these helpers normalize a couple of likely shapes (an array
// directly, or `{ data: [...] }`) and fall back to common field-name
// variants so the page renders once Rufus's endpoints are live, without
// needing changes here. Adjust the field lookups below if the real
// payload uses different keys.
function toArray(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  return [];
}

function tooltipStyle() {
  return {
    background: colors.panel,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.sm,
    color: colors.textPrimary,
    fontSize: '12px',
  };
}

function ChartCard({ icon: Icon, title, subtitle, loading, empty, emptyHint, children }) {
  return (
    <Card style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
        <div
          style={{
            width: '34px', height: '34px', borderRadius: '10px',
            background: colors.accentSoft, color: colors.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          <Icon size={16} />
        </div>
        <div>
          <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: '15px' }}>{title}</div>
          {subtitle ? <div style={{ color: colors.textMuted, fontSize: '12px' }}>{subtitle}</div> : null}
        </div>
      </div>
      {loading ? (
        <div style={{ color: colors.textMuted, padding: '30px 0', textAlign: 'center' }}>Loading…</div>
      ) : empty ? (
        <div style={{ color: colors.textMuted, padding: '30px 0', textAlign: 'center', fontSize: '13px' }}>{emptyHint}</div>
      ) : (
        children
      )}
    </Card>
  );
}

export default function Analytics() {
  const [trends, setTrends] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState({ trends: true, dishes: true, segments: true });
  const [error, setError] = useState('');

  useEffect(() => {
    getSalesTrends()
      .then((res) => setTrends(toArray(res)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading((l) => ({ ...l, trends: false })));

    getTopDishes()
      .then((res) => setDishes(toArray(res)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading((l) => ({ ...l, dishes: false })));

    getCustomerSegments()
      .then((res) => setSegments(toArray(res)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading((l) => ({ ...l, segments: false })));
  }, []);

  const trendData = trends.map((t) => ({
    label: t.period || t.date || t.label || '',
    revenue: Number(t.revenue ?? t.total ?? t.amount ?? 0),
  }));

  const dishData = dishes
    .map((d) => ({
      name: d.name || d.dish || d.menuItem?.name || 'Item',
      orders: Number(d.orders ?? d.count ?? d.quantity ?? 0),
    }))
    .slice(0, 8);

  const segmentData = segments.map((s) => ({
    name: s.segment || s.name || 'unknown',
    value: Number(s.count ?? s.total ?? 0),
  }));

  return (
    <AdminLayout title="Analytics">
      <PageTitle subtitle="Sales trends, top-selling dishes, and customer segments">
        Analytics
      </PageTitle>

      <ErrorText>{error}</ErrorText>

      <ChartCard
        icon={TrendingUp}
        title="Sales Trends"
        subtitle="Revenue over time"
        loading={loading.trends}
        empty={!loading.trends && trendData.length === 0}
        emptyHint="No sales data yet — figures will appear here as orders come in."
      >
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trendData} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={colors.border} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" stroke={colors.textMuted} fontSize={11} tickLine={false} axisLine={{ stroke: colors.border }} />
            <YAxis stroke={colors.textMuted} fontSize={11} tickLine={false} axisLine={{ stroke: colors.border }} />
            <Tooltip contentStyle={tooltipStyle()} formatter={(v) => [`₦${Number(v).toLocaleString()}`, 'Revenue']} />
            <Line type="monotone" dataKey="revenue" stroke={colors.accent} strokeWidth={2.5} dot={{ r: 3, fill: colors.accent }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <ChartCard
          icon={UtensilsCrossed}
          title="Top-Selling Dishes"
          subtitle="By order volume"
          loading={loading.dishes}
          empty={!loading.dishes && dishData.length === 0}
          emptyHint="No orders yet — top dishes will show up once orders come in."
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dishData} layout="vertical" margin={{ top: 4, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={colors.border} strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" stroke={colors.textMuted} fontSize={11} tickLine={false} axisLine={{ stroke: colors.border }} />
              <YAxis
                type="category"
                dataKey="name"
                stroke={colors.textMuted}
                fontSize={11}
                width={110}
                tickLine={false}
                axisLine={{ stroke: colors.border }}
              />
              <Tooltip contentStyle={tooltipStyle()} formatter={(v) => [v, 'Orders']} />
              <Bar dataKey="orders" fill={colors.accentSecondary} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          icon={Users}
          title="Customer Segments"
          subtitle="New, regular, and VIP customers"
          loading={loading.segments}
          empty={!loading.segments && segmentData.length === 0}
          emptyHint="No customer data yet — segments will populate as customers place orders."
        >
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={segmentData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {segmentData.map((entry, i) => (
                  <Cell key={i} fill={SEGMENT_COLOR[entry.name] || colors.textMuted} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle()} />
              <Legend
                iconType="circle"
                formatter={(value) => <span style={{ color: colors.textMuted, fontSize: '12px', textTransform: 'capitalize' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </AdminLayout>
  );
}