import axios, { AxiosResponse } from "axios";

const BASE_URL = `${process.env.NEXT_PUBLIC_API_KAI_OFFICE_BASE_URL}/api/auth/user`;

export async function registerUser(payload) {
  const res = await axios.post(`${BASE_URL}/register`, payload);
  return res;
}

export async function loginUser(payload) {
  const res = await axios.post(`${BASE_URL}/login`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res;
}

export async function fetchUserById(id) {
  const { data } = await axios.get(`${BASE_URL}/${id}`);
  return data;
}

export async function updateUser(payload) {
  const res = await axios.patch(`${BASE_URL}`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res;
}
