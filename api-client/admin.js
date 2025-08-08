import axios, { AxiosResponse } from "axios";

const BASE_URL = `${process.env.NEXT_PUBLIC_API_KAI_OFFICE_BASE_URL}/api/auth/admin`;

export async function registerAdmin(payload) {
  const res = await axios.post(`${BASE_URL}/register`, payload);
  return res;
}

export async function loginAdmin(payload) {
  const res = await axios.post(`${BASE_URL}/login`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res;
}
