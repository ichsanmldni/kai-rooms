import axios from "axios";

const BASE_URL = `${process.env.NEXT_PUBLIC_API_KAI_OFFICE_BASE_URL}/api/tnc`;

export async function fetchTncList() {
  const url = BASE_URL;
  const { data } = await axios.get(url);
  return data;
}

export async function fetchTncById(id) {
  const { data } = await axios.get(`${BASE_URL}/${id}`);
  return data;
}

export async function createTnc(payload) {
  const { data } = await axios.post(BASE_URL, payload);
  return data;
}

export async function updateTnc(payload) {
  const { data } = await axios.patch(BASE_URL, payload);
  return data;
}

export async function deleteTnc(id) {
  const { data } = await axios.delete(BASE_URL, { data: { id } });
  return data;
}
