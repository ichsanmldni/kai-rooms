import axios from "axios";

const BASE_URL = `${process.env.NEXT_PUBLIC_API_KAI_OFFICE_BASE_URL}/api/unit`;

export async function fetchUnitList() {
  const url = BASE_URL;
  const { data } = await axios.get(url);
  return data;
}

export async function createUnit(payload) {
  const { data } = await axios.post(BASE_URL, payload);
  return data;
}

export async function updateUnit(payload) {
  const { data } = await axios.patch(BASE_URL, payload);
  return data;
}

export async function deleteUnit(id) {
  const { data } = await axios.delete(BASE_URL, { data: { id } });
  return data;
}
