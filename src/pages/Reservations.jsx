import React, { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { getAvailableSlots, createReservation, getTables } from '../api/maleek';
import { PageTitle, Card, Button, Input, Select, ErrorText, StatusPill } from '../components/ui';
import { colors } from '../styles/tokens';

const TIME_SLOTS = ['18:00', '19:00', '20:00', '21:00', '22:00'];

export default function Reservations() {
  const [tables, setTables] = useState([]);
  const [booked, setBooked] = useState([]);
  const [date, setDate] = useState('');
  const [partySize, setPartySize] = useState('2');
  const [timeSlot, setTimeSlot] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadTables();
  }, []);

  useEffect(() => {
    if (date) {
      loadBookedSlots();
    } else {
      setBooked([]);
    }
  }, [date]);

  const loadTables = async () => {
    try {
      const data = await getTables();
      setTables(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadBookedSlots = async () => {
    try {
      const data = await getAvailableSlots(date);
      setBooked(data.booked || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!date || !timeSlot || !partySize) {
      return setError('Please fill in all fields.');
    }

    // Find an available table that fits the party size
    const availableTables = tables.filter(t => t.capacity >= Number(partySize));
    if (availableTables.length === 0) {
      return setError('We do not have a table large enough for your party.');
    }

    // Filter out tables that are already booked for this date & timeslot
    const bookedTableIds = booked
      .filter(b => b.timeSlot === timeSlot)
      .map(b => (typeof b.table === 'object' ? b.table._id : b.table));

    const tableToBook = availableTables.find(t => !bookedTableIds.includes(t._id));

    if (!tableToBook) {
      return setError('No tables available for this time slot. Please choose another time.');
    }

    try {
      setLoading(true);
      await createReservation({ tableId: tableToBook._id, date, timeSlot });
      setSuccess(`Table booked successfully for ${date} at ${timeSlot}!`);
      setDate('');
      setTimeSlot('');
      setBooked([]);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <PageTitle description="Book a table for your next visit">Table Reservations</PageTitle>
      
      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <Card title="Book a Table">
          <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <Input 
              label="Date" 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              min={new Date().toISOString().split('T')[0]} 
              required
            />
            
            <Select label="Party Size" value={partySize} onChange={e => setPartySize(e.target.value)} required>
              <option value="1">1 Person</option>
              <option value="2">2 People</option>
              <option value="3">3 People</option>
              <option value="4">4 People</option>
              <option value="5">5 People</option>
              <option value="6">6 People</option>
              <option value="8">8 People</option>
              <option value="10">10 People</option>
            </Select>

            {date && (
              <div>
                <label style={{ display: 'block', fontSize: '11px', letterSpacing: '.08em', textTransform: 'uppercase', color: colors.textMuted, marginBottom: '6px' }}>
                  Available Time Slots
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {TIME_SLOTS.map(slot => {
                    // Check if all tables big enough for the party are booked
                    const availableTables = tables.filter(t => t.capacity >= Number(partySize));
                    const bookedTableIds = booked
                      .filter(b => b.timeSlot === slot)
                      .map(b => (typeof b.table === 'object' ? b.table._id : b.table));
                    const tableToBook = availableTables.find(t => !bookedTableIds.includes(t._id));
                    
                    const isAvailable = !!tableToBook;

                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => setTimeSlot(slot)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: `1px solid ${timeSlot === slot ? colors.accent : colors.border}`,
                          background: timeSlot === slot ? colors.accent : 'transparent',
                          color: timeSlot === slot ? '#fff' : (isAvailable ? colors.text : colors.textMuted),
                          cursor: isAvailable ? 'pointer' : 'not-allowed',
                          opacity: isAvailable ? 1 : 0.5
                        }}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <ErrorText>{error}</ErrorText>
            {success && <div style={{ color: '#4caf50', fontSize: '13px', margin: '10px 0' }}>{success}</div>}

            <Button type="submit" disabled={loading || !date || !timeSlot}>
              {loading ? 'Booking...' : 'Confirm Reservation'}
            </Button>
          </form>
        </Card>

        <Card>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Your Upcoming Reservations</h3>
          <p style={{ color: colors.textMuted, fontSize: '13px' }}>
            We're currently not storing your reservation history in this view. Please contact support if you need to modify an existing reservation.
          </p>
        </Card>
      </div>
    </AppLayout>
  );
}
