// api-client/user.js
import axios from "axios";

const BASE_URL = `${process.env.NEXT_PUBLIC_API_KAI_OFFICE_BASE_URL}/api/auth/user`;

// REGISTER - sekarang payload bisa mengirim nipp
export async function registerUser(payload) {
  // payload: { name, nipp, email, noTelp, password, unitId, agree }
  const res = await axios.post(`${BASE_URL}/register`, {
    name: payload.name,
    nipp: payload.nipp, // tambahan NIPP
    email: payload.email,
    no_telp: payload.noTelp, // disesuaikan jika backend pakai snake_case
    password: payload.password,
    unit_id: payload.unitId
  });
  return res;
}

// LOGIN - input email juga bisa diisi NIPP
export async function loginUser(payload) {
  // payload: { identifier, password } 
  // identifier = email atau NIPP
  const res = await axios.post(`${BASE_URL}/login`, {
    identifier: payload.email, // di UI namanya 'email', tapi isinya bisa email atau NIPP
    password: payload.password
  }, {
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

export async function lupaPasswordUser(payload) {
  const res = await axios.post(`${BASE_URL}/lupa-password`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res;
}

export async function verifyTokenUser(payload) {
  const res = await axios.post(`${BASE_URL}/verify-token`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res;
}

export async function resetPasswordUser(payload) {
  const res = await axios.post(`${BASE_URL}/reset-password`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res;
}
