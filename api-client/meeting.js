import axios from "axios";

const BASE_URL = `${process.env.NEXT_PUBLIC_API_KAI_OFFICE_BASE_URL}/api/meetings`;

export async function fetchMeetingList(userId, roomId) {
  const params = new URLSearchParams();

  if (userId) params.append("user_id", userId);
  if (roomId) params.append("room_id", userId);

  const url = `${BASE_URL}?${params.toString()}`;
  const { data } = await axios.get(url);
  return data;
}

export async function createMeeting(payload) {
  const { data } = await axios.post(BASE_URL, payload);
  return data;
}

export async function updateMeeting(payload) {
  const { data } = await axios.patch(BASE_URL, payload);
  return data;
}

export async function deleteMeeting(id) {
  const { data } = await axios.delete(BASE_URL, { data: { id } });
  return data;
}
