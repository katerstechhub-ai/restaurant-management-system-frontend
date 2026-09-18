import { useEffect, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { getAllReservations } from '../api/reservations';
import { colors, statusColor, font, radius } from '../styles/tokens';
import AdminLayout from '../components/AdminLayout';
import { Card, Input, StatusPill, PageTitle, ErrorText, EmptyState } from '../components/ui';

// Fixed slots, matching Reservations.jsx (the customer-facing page) so
// labels are consistent everywhere a timeSlot value shows up.
const TIME_SLOTS = {
  '12:00': '12:00 PM — Lunch',
  '13:00': '1:00 PM — Lunch',
  '14:00': '2:00 PM — Lunch',
  '18:00': '6:00 PM — Dinner',
  '19:00': '7:00 PM — Dinner',
  '20:00': '8:00 PM — Dinner',
  '21:00': '9:00 PM — Dinner',
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function StaffReservations() {
  const [date, setDate] = useState(todayISO());
  const [showAllDates, setShowAllDates] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    getAllReservations(showAllDates ? null : date)
      .then(setReservations)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [date, showAllDates]);

  const timeSlotLabel = (value) => TIME_SLOTS[value] || value;

  return (
    <AdminLayout title="Reservations">
      <PageTitle subtitle={`${reservations.length} reservation(s)`}>Reservations</PageTitle>

      <Card style={{ maxWidth: '460px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'end', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 160px', opacity: showAllDates ? 0.5 : 1 }}>
            <label style={{ display: 'block', fontSize: '13px', color: colors.textMuted, marginBottom: '6px' }}>
              Date
            </label>
            <Input
              type="date"
              value={date}
              disabled={showAllDates}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <label style={{
            display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px',
            color: colors.textMuted, cursor: 'pointer', paddingBottom: '10px',
          }}>
            <input
              type="checkbox"
              checked={showAllDates}
              onChange={(e) => setShowAllDates(e.target.checked)}
            />
            Show all dates
          </label>
        </div>
      </Card>

      <ErrorText>{error}</ErrorText>

      {loading ? (
        <div style={{ color: colors.textMuted }}>Loading reservations…</div>
      ) : reservations.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No reservations"
          hint={showAllDates ? 'No reservations have been made yet.' : 'No reservations for this date.'}
        />
      ) : (
        reservations.map((r) => (
          <Card key={r._id} hover style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontFamily: font.display, fontWeight: 700 }}>
                  Table {r.table?.tableNumber ?? '—'} {r.table?.capacity ? `· seats ${r.table.capacity}` : ''}
                  {r.customer?.name ? ` · ${r.customer.name}` : ''}
                </div>
                <div style={{ color: colors.textMuted, fontSize: '13px', marginTop: '5px' }}>
                  {r.date ? new Date(r.date).toLocaleDateString() : ''} · {timeSlotLabel(r.timeSlot)}
                  {r.customer?.email ? ` · ${r.customer.email}` : ''}
                </div>
              </div>
              <StatusPill status={r.status} color={statusColor(r.status)} />
            </div>
          </Card>
        ))
      )}
    </AdminLayout>
  );
}