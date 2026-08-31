import { useEffect, useState } from 'react';
import { colors, font } from '../styles/tokens';
import { Card, Button, ErrorText } from '../components/ui';
import {
  getTables,
  getAvailableSlots,
  getMyReservations,
  createReservation,
  cancelReservation,
} from '../api/maleek';
import SeatingMap from '../components/SeatingMap';

// Placeholder slots — swap for whatever service windows the restaurant actually offers.
const TIME_SLOTS = ['12:00 PM', '1:00 PM', '2:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'];

// Mirrors the normalization in pages/FloorPlan.jsx (admin) — getTables' response
// shape isn't locked down yet, so this keeps the page from throwing if it
// comes back as a bare array vs. { tables: [...] } vs. { data: [...] }.
function toTableArray(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.tables)) return res.tables;
  if (Array.isArray(res?.data)) return res.data;
  return [];
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function Reservations() {
  const [tables, setTables] = useState([]);
  const [date, setDate] = useState(todayISO());
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [bookedTableIds, setBookedTableIds] = useState(new Set());
  const [selectedTable, setSelectedTable] = useState(null);
  const [partySize, setPartySize] = useState(2);
  const [myReservations, setMyReservations] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getTables().then((data) => setTables(toTableArray(data))).catch(() => setTables([]));
    loadMyReservations();
  }, []);

  useEffect(() => {
    setSelectedTable(null);
    getAvailableSlots(date)
      .then((data) => {
        const bookedForSlot = (data.booked || [])
          .filter((r) => r.timeSlot === timeSlot)
          .map((r) => r.table?._id || r.table);
        setBookedTableIds(new Set(bookedForSlot));
      })
      .catch(() => setBookedTableIds(new Set()));
  }, [date, timeSlot]);

  const loadMyReservations = () => {
    getMyReservations().then(setMyReservations).catch(() => setMyReservations([]));
  };

  const handleConfirm = async () => {
    if (!selectedTable) return;
    setError('');
    setBusy(true);
    try {
      await createReservation({ tableId: selectedTable._id, date, timeSlot });
      setSelectedTable(null);
      // Refresh availability and history so the just-booked table shows as taken
      const data = await getAvailableSlots(date);
      const bookedForSlot = (data.booked || [])
        .filter((r) => r.timeSlot === timeSlot)
        .map((r) => r.table?._id || r.table);
      setBookedTableIds(new Set(bookedForSlot));
      loadMyReservations();
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelReservation(id);
      loadMyReservations();
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 16px', fontFamily: font.body }}>
      <h1 style={{ fontFamily: font.display, fontSize: '24px', color: colors.textPrimary, marginBottom: '20px' }}>
        Reserve a Table
      </h1>

      <Card>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: colors.textMuted, marginBottom: '4px' }}>
              Date
            </label>
            <input
              type="date"
              value={date}
              min={todayISO()}
              onChange={(e) => setDate(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: colors.textMuted, marginBottom: '4px' }}>
              Time
            </label>
            <select
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc' }}
            >
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: colors.textMuted, marginBottom: '4px' }}>
              Party size
            </label>
            <input
              type="number"
              min={1}
              value={partySize}
              onChange={(e) => setPartySize(Number(e.target.value))}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc', width: '80px' }}
            />
          </div>
        </div>

        <SeatingMap
          tables={tables}
          bookedTableIds={bookedTableIds}
          selectedTableId={selectedTable?._id}
          onSelectTable={(table) => {
            if (table.capacity < partySize) {
              setError(`Table ${table.tableNumber} only seats ${table.capacity}`);
              return;
            }
            setError('');
            setSelectedTable(table);
          }}
        />

        <ErrorText>{error}</ErrorText>

        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <Button disabled={!selectedTable || busy} onClick={handleConfirm}>
            {busy ? 'Booking...' : selectedTable ? `Book Table ${selectedTable.tableNumber}` : 'Select a table'}
          </Button>
        </div>
      </Card>

      <h2 style={{ fontFamily: font.display, fontSize: '18px', color: colors.textPrimary, margin: '32px 0 12px' }}>
        My Reservations
      </h2>
      {myReservations.length === 0 ? (
        <p style={{ color: colors.textMuted, fontSize: '13px' }}>You have no reservations yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {myReservations.map((r) => (
            <Card key={r._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, color: colors.textPrimary }}>
                  Table {r.table?.tableNumber} · {r.timeSlot}
                </div>
                <div style={{ fontSize: '13px', color: colors.textMuted }}>
                  {new Date(r.date).toLocaleDateString()} · {r.status}
                </div>
              </div>
              {r.status === 'confirmed' && (
                <Button variant="secondary" onClick={() => handleCancel(r._id)}>
                  Cancel
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}