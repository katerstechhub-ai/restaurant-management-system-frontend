import { useEffect, useState } from 'react';
import {
  CalendarDays, Users2, CheckCircle2,
  Wallet as WalletIcon, CreditCard, Landmark,
} from 'lucide-react';
import {
  getTableAvailability, getMyReservations, createReservation,
  verifyReservationPayment, cancelReservation,
} from '../api/reservations';
import { getWallet } from '../api/wallet';
import { useAuth } from '../context/AuthContext';
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

const PAYMENT_METHODS = [
  { value: 'wallet', label: 'Wallet', Icon: WalletIcon },
  { value: 'paystack', label: 'Card', Icon: CreditCard },
  { value: 'bank_transfer', label: 'Bank Transfer', Icon: Landmark },
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function Reservations() {
  const { user } = useAuth();
  const [date, setDate] = useState(todayISO());
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0].value);
  const [tables, setTables] = useState([]);
  const [fee, setFee] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [balance, setBalance] = useState(null);
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
      .then((data) => {
        setTables(data.tables || []);
        setFee(data.fee ?? null);
      })
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
  useEffect(() => {
    getWallet().then((res) => setBalance(res.balance)).catch(() => {});
  }, []);

  // Reservations still awaiting confirmation (bank transfer pending staff
  // review) benefit from the same light polling pattern Orders.jsx uses,
  // so "payment received" appears without a manual refresh.
  useEffect(() => {
    const hasPending = myReservations.some((r) => r.paymentStatus === 'pending' && r.status === 'confirmed');
    if (!hasPending) return;
    const interval = setInterval(loadMyReservations, 15000);
    return () => clearInterval(interval);
  }, [myReservations]);

  const handleSelectTable = (table) => {
    setJustBooked(null);
    setBookError('');
    setSelectedTable((prev) => (prev && prev._id === table._id ? null : table));
  };

  // Opens Paystack's inline popup for the reservation fee — same pattern
  // used at checkout, customer types their card directly, no redirect.
  const payWithPaystack = (reservation) => {
    if (!window.PaystackPop) {
      setBookError('Payment library not loaded. Refresh and try again.');
      setBooking(false);
      setJustBooked(reservation);
      return;
    }

    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: user.email,
      amount: Math.round(Number(reservation.amount) * 100), // kobo
      metadata: { reservationId: reservation._id },
      callback: (response) => {
        verifyReservationPayment(reservation._id, response.reference)
          .then((verified) => setJustBooked(verified))
          .catch((err) => setBookError(err.message))
          .finally(() => {
            setBooking(false);
            loadAvailability();
            loadMyReservations();
          });
      },
      onClose: () => {
        setBooking(false);
        setJustBooked(reservation);
        loadAvailability();
        loadMyReservations();
      },
    });

    handler.openIframe();
  };

  const handleConfirm = async () => {
    if (!selectedTable) return;
    setBooking(true);
    setBookError('');
    try {
      const reservation = await createReservation({
        tableId: selectedTable._id,
        date,
        timeSlot,
        paymentMethod,
      });
      setSelectedTable(null);

      if (paymentMethod === 'paystack') {
        payWithPaystack(reservation);
        return;
      }

      setJustBooked(reservation);
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
  const hasEnoughBalance = balance !== null && fee !== null && balance >= fee;

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
          <div style={{ marginTop: '18px' }}>
            <div
              style={{
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
              {fee !== null && (
                <div style={{ fontFamily: font.display, fontWeight: 700, color: colors.accent }}>
                  ₦{Number(fee).toFixed(2)} fee
                </div>
              )}
            </div>

            <div style={{ marginTop: '14px' }}>
              <div style={{ color: colors.textMuted, fontSize: '13px', marginBottom: '10px' }}>Pay with</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {PAYMENT_METHODS.map(({ value, label, Icon }) => (
                  <button
                    key={value}
                    onClick={() => setPaymentMethod(value)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '12px 8px',
                      borderRadius: radius.sm,
                      border: `1px solid ${paymentMethod === value ? colors.accent : colors.border}`,
                      background: paymentMethod === value ? `${colors.accent}15` : colors.panelAlt,
                      color: paymentMethod === value ? colors.accent : colors.textMuted,
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Icon size={18} /> {label}
                  </button>
                ))}
              </div>

              {paymentMethod === 'wallet' && (
                <div style={{
                  marginTop: '12px', padding: '12px 14px', borderRadius: radius.sm,
                  background: colors.panelAlt, display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', fontSize: '13px',
                }}>
                  <span style={{ color: colors.textMuted }}>Wallet balance</span>
                  <span style={{ fontWeight: 700, color: hasEnoughBalance ? colors.text : colors.accent }}>
                    {balance === null ? '—' : `₦${Number(balance).toFixed(2)}`}
                  </span>
                </div>
              )}

              {paymentMethod === 'bank_transfer' && (
                <div style={{ marginTop: '12px', fontSize: '12px', color: colors.textMuted }}>
                  Bank details are shown after you confirm — your table stays held until we receive the transfer.
                </div>
              )}

              {paymentMethod === 'paystack' && (
                <div style={{ marginTop: '12px', fontSize: '12px', color: colors.textMuted }}>
                  You'll enter your card details in a secure popup on this page.
                </div>
              )}
            </div>

            <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleConfirm} disabled={booking}>
                {booking ? 'Booking…' : 'Confirm & pay reservation'}
              </Button>
            </div>
          </div>
        )}

        <ErrorText>{bookError}</ErrorText>

        {justBooked && (
          <div
            style={{
              marginTop: '14px',
              padding: '14px',
              borderRadius: radius.sm,
              background: justBooked.paymentStatus === 'paid' ? `${colors.success || '#4caf50'}15` : `${colors.accent}15`,
              color: justBooked.paymentStatus === 'paid' ? (colors.success || '#4caf50') : colors.accent,
              fontSize: '13px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}>
              <CheckCircle2 size={16} />
              {justBooked.paymentStatus === 'paid'
                ? `Reservation confirmed and paid for ${timeSlotLabel(justBooked.timeSlot)} on ${justBooked.date?.slice(0, 10)}.`
                : `Reservation held for ${timeSlotLabel(justBooked.timeSlot)} on ${justBooked.date?.slice(0, 10)} — payment pending.`}
            </div>

            {justBooked.bankDetails && justBooked.paymentStatus === 'pending' && (
              <div style={{
                marginTop: '12px', padding: '14px', borderRadius: radius.sm,
                background: colors.panelAlt, textAlign: 'left', color: colors.text,
              }}>
                <div style={{ color: colors.textMuted, marginBottom: '8px' }}>
                  Transfer the exact fee to:
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ color: colors.textMuted }}>Bank</span>
                  <strong>{justBooked.bankDetails.bankName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ color: colors.textMuted }}>Account number</span>
                  <strong>{justBooked.bankDetails.accountNumber}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ color: colors.textMuted }}>Account name</span>
                  <strong>{justBooked.bankDetails.accountName}</strong>
                </div>
                <div style={{ marginTop: '10px', color: colors.textMuted, fontSize: '12px' }}>
                  You'll see "Payment received" below in My Reservations once we confirm it.
                </div>
              </div>
            )}
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
                  {r.date ? new Date(r.date).toLocaleDateString() : ''} · {timeSlotLabel(r.timeSlot)} · ₦{Number(r.amount).toFixed(2)}
                </div>
                <div style={{ fontSize: '12px', marginTop: '4px', color: r.paymentStatus === 'paid' ? (colors.success || '#4caf50') : colors.accent }}>
                  {r.paymentStatus === 'paid' ? '✓ Payment received' : r.paymentStatus === 'failed' ? 'Payment failed' : 'Payment pending'}
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