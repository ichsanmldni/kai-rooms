import axios from "axios";

const BASE_URL = `${process.env.NEXT_PUBLIC_API_KAI_OFFICE_BASE_URL}/api/employee`;

export async function fetchEmployeeList(userId, unitId) {
  const params = new URLSearchParams();

  if (userId) params.append("user_id", userId);
  if (unitId) params.append("unit_id", unitId); // tambahan filter unit

  const url = `${BASE_URL}?${params.toString()}`;
  const { data } = await axios.get(url);
  return data;
}


export async function createEmployee(payload) {
  const { data } = await axios.post(BASE_URL, payload);
  return data;
}

export async function updateEmployee(payload) {
  const { data } = await axios.patch(BASE_URL, payload);
  return data;
}

export async function deleteEmployee(id) {
  const { data } = await axios.delete(BASE_URL, { data: { id } });
  return data;
}
