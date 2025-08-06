import axios, { AxiosResponse } from "axios";

const BASE_URL = `${process.env.NEXT_PUBLIC_API_KAI_OFFICE_BASE_URL}/api/settings`;

export async function fetchSetting(userId) {
  const params = new URLSearchParams();

  if (userId) params.append("user_id", userId);

  const url = `${BASE_URL}?${params.toString()}`;
  const { data } = await axios.get(url);
  return data;
}
export async function fetchSettingById(id) {
  const { data } = await axios.get(`${BASE_URL}/${id}`);
  return data;
}

export async function updateSetting(payload) {
  const res = await axios.patch(`${BASE_URL}`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res;
}
