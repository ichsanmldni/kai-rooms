import axios from "axios";

const BASE_URL = `${process.env.NEXT_PUBLIC_API_KAI_OFFICE_BASE_URL}/api/booking`;

export async function fetchBookingList(date, roomId) {
  const params = new URLSearchParams();

  if (date) params.append("date", date);
  if (roomId) params.append("room_id", roomId);

  const url = `${BASE_URL}?${params.toString()}`;

  const { data } = await axios.get(url);
  return data;
}

export async function createBooking(payload) {
  const { data } = await axios.post(BASE_URL, payload);
  return data;
}

export async function updateBooking(payload) {
  const { data } = await axios.patch(BASE_URL, payload);
  return data;
}

export async function deleteBooking(id) {
  const { data } = await axios.delete(BASE_URL, { data: { id } });
  return data;
}
