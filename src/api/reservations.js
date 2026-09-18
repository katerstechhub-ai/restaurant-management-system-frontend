import client from './client';

export async function getAvailableSlots(date) {
  const res = await client.get('/reservations/available', { params: { date } });
  return res.data;
}

// The seat-map endpoint — every table annotated as available/booked/unavailable
// for a specific date + timeSlot. Was missing entirely; Reservations.jsx
// already called this expecting it to exist.
export async function getTableAvailability({ date, timeSlot }) {
  const res = await client.get('/reservations/availability', { params: { date, timeSlot } });
  return res.data;
}

export async function getMyReservations() {
  const res = await client.get('/reservations/mine');
  return res.data;
}

// Admin/waiter/kitchen only — every reservation, optionally filtered to one date.
export async function getAllReservations(date) {
  const res = await client.get('/reservations', { params: date ? { date } : {} });
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