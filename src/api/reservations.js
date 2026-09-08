import client from './client';

export async function getAvailableSlots(date) {
  const res = await client.get('/reservations/available', { params: { date } });
  return res.data;
}

// The seat-map endpoint — every table annotated with 'available' | 'booked' |
// 'unavailable' for this exact date + timeSlot. No auth required, so the
// picker works before login too.
export async function getTableAvailability({ date, timeSlot }) {
  const res = await client.get('/reservations/availability', { params: { date, timeSlot } });
  return res.data;
}

export async function getMyReservations() {
  const res = await client.get('/reservations/mine');
  return res.data;
}

export async function createReservation({ tableId, date, timeSlot }) {
  const res = await client.post('/reservations', { tableId, date, timeSlot });
  return res.data;
}

export async function cancelReservation(id) {
  const res = await client.delete(`/reservations/${id}`);
  return res.data;
}