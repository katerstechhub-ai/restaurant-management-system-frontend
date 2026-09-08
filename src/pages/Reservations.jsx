import { useEffect, useState } from 'react';
import { CalendarDays, Users2, CheckCircle2 } from 'lucide-react';
import { getTableAvailability, getMyReservations, createReservation, cancelReservation } from '../api/reservations';
import { colors, statusColor, radius, font } from '../styles/tokens';
import AppLayout from '../components/AppLayout';
import SeatingMap from '../components/SeatingMap';
import { Card, Button, Select, StatusPill, PageTitle, ErrorText, EmptyState } from '../components/ui';

// Fixed slots, like picking a flight departure time rather than a free-form
// clock — keeps the seat map meaningful (a table's availability only makes
// sense relative to one of these slots).
const TIME_SLOTS = [
  { value: '12:00', label: '12:00 PM — Lunch' },
  { value: '13:00', label: '1:00 PM — Lunch' },
  { value: '14:00', label: '2:00 PM — Lunch' },
  { value: '18:00', label: '6:00 PM — Dinner' },
  { value: '19:00', label: '7:00 PM — Dinner' },
  { value: '20:00', label: '8:00 PM — Dinner' },
  { value: '21:00', label: '9:00 PM — Dinner' },
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function Reservations() {
  const [date, setDate] = useState(todayISO());
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0].value);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState('');

  const [booking, setBooking] = useState(false);
  const [bookError, setBookError] = useState('');
  const [justBooked, setJustBooked] = useState(null);

  const [myReservations, setMyReservations] = useState([]);
  const [myLoading, setMyLoading] = useState(true);
  const [myError, setMyError] = useState('');

  const loadAvailability = () => {
    setMapLoading(true);
    setMapError('');
    setSelectedTable(null);
    getTableAvailability({ date, timeSlot })
      .then((data) => setTables(data.tables || []))
      .catch((err) => setMapError(err.message))
      .finally(() => setMapLoading(false));
  };

  const loadMyReservations = () => {
    setMyLoading(true);
    getMyReservations()
      .then(setMyReservations)
      .catch((err) => setMyError(err.message))
      .finally(() => setMyLoading(false));
  };

  useEffect(loadAvailability, [date, timeSlot]);
  useEffect(loadMyReservations, []);

  const handleSelectTable = (table) => {
    setJustBooked(null);
    setBookError('');
    setSelectedTable((prev) => (prev && prev._id === table._id ? null : table));
  };

  const handleConfirm = async () => {
    if (!selectedTable) return;
    setBooking(true);
    setBookError('');
    try {
      const reservation = await createReservation({ tableId: selectedTable._id, date, timeSlot });
      setJustBooked(reservation);
      setSelectedTable(null);
      loadAvailability();
      loadMyReservations();
    } catch (err) {
      setBookError(err.response?.data?.message || err.message);
      // The slot may have just been taken by someone else — refresh so the
      // seat map reflects reality instead of showing a stale "available".
      loadAvailability();
    } finally {
      setBooking(false);
    }
  };

  const handleCancel = async (id) => {
    setMyError('');
    try {
      await cancelReservation(id);
      loadMyReservations();
      loadAvailability();
    } catch (err) {
      setMyError(err.response?.data?.message || err.message);
    }
  };

  const timeSlotLabel = (value) => TIME_SLOTS.find((s) => s.value === value)?.label || value;

  return (
    <AppLayout>
      <PageTitle subtitle="Pick a date and time, then choose your table">Reservations</PageTitle>

      <Card style={{ maxWidth: '760px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <div style={{ flex: '1 1 180px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: colors.textMuted, marginBottom: '6px' }}>
              <CalendarDays size={14} /> Date
            </label>
            <input
              type="date"
              value={date}
              min={todayISO()}
              onChange={(e) => setDate(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: radius.sm,
                border: `1px solid ${colors.border}`,
                background: colors.panelAlt,
                color: colors.text,
                fontFamily: font.body,
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ flex: '1 1 220px' }}>
            <Select label="Time" value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
              {TIME_SLOTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </Select>
          </div>
        </div>

        <ErrorText>{mapError}</ErrorText>

        {mapLoading ? (
          <div style={{ color: colors.textMuted, padding: '40px 0', textAlign: 'center' }}>Loading tables…</div>
        ) : (
          <SeatingMap tables={tables} selectedTableId={selectedTable?._id} onSelectTable={handleSelectTable} />
        )}

        {selectedTable && (
          <div
            style={{
              marginTop: '18px',
              padding: '14px',
              borderRadius: radius.sm,
              background: colors.panelAlt,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: colors.textMuted }}>
              <Users2 size={15} />
              Table {selectedTable.tableNumber} · seats {selectedTable.capacity} · {timeSlotLabel(timeSlot)} on {date}
            </div>
            <Button onClick={handleConfirm} disabled={booking}>
              {booking ? 'Booking…' : 'Confirm reservation'}
            </Button>
          </div>
        )}

        <ErrorText>{bookError}</ErrorText>

        {justBooked && (
          <div
            style={{
              marginTop: '14px',
              padding: '14px',
              borderRadius: radius.sm,
              background: `${colors.success || '#4caf50'}15`,
              color: colors.success || '#4caf50',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            <CheckCircle2 size={16} />
            Reservation confirmed for {timeSlotLabel(justBooked.timeSlot)} on {justBooked.date?.slice(0, 10)}.
          </div>
        )}
      </Card>

      <PageTitle subtitle={`${myReservations.length} total`}>My reservations</PageTitle>

      <ErrorText>{myError}</ErrorText>

      {myLoading ? (
        <div style={{ color: colors.textMuted }}>Loading your reservations…</div>
      ) : myReservations.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No reservations yet" hint="Book a table above to see it here." />
      ) : (
        myReservations.map((r) => (
          <Card key={r._id} hover style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontFamily: font.display, fontWeight: 700 }}>
                  Table {r.table?.tableNumber ?? '—'} {r.table?.capacity ? `· seats ${r.table.capacity}` : ''}
                </div>
                <div style={{ color: colors.textMuted, fontSize: '13px', marginTop: '5px' }}>
                  {r.date ? new Date(r.date).toLocaleDateString() : ''} · {timeSlotLabel(r.timeSlot)}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <StatusPill status={r.status} color={statusColor(r.status)} />
                {r.status === 'confirmed' && (
                  <Button variant="soft" onClick={() => handleCancel(r._id)}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))
      )}
    </AppLayout>
  );
}