import axios from "axios";

const BASE_URL = `${process.env.NEXT_PUBLIC_API_KAI_OFFICE_BASE_URL}/api/meetings`;

// Fungsi helper untuk log error
function logAxiosError(context, error) {
  console.log(`=== Error ${context} ===`, error);

  if (axios.isAxiosError(error)) {
    console.log("Message:", error.message);

    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Data:", error.response.data);
      console.log("Headers:", error.response.headers);
    } else if (error.request) {
      console.log("No response received. Request:", error.request);
    } else {
      console.log("Error setup:", error.message);
    }
  } else {
    console.log("Non-Axios Error:", error);
  }

  console.log("===========================");
}

export async function fetchMeetingList(userId, roomId) {
  try {
    const params = new URLSearchParams();

    if (userId) params.append("user_id", userId);
    if (roomId) params.append("room_id", roomId);

    const url = `${BASE_URL}?${params.toString()}`;
    const { data } = await axios.get(url);
    return data;
  } catch (error) {
    logAxiosError("GET /meetings", error);
    throw error;
  }
}

export async function createMeeting(payload) {
  try {
    const { data } = await axios.post(BASE_URL, payload);
    return data;
  } catch (error) {
    logAxiosError("POST /meetings", error);
    throw error;
  }
}

export async function updateMeeting(payload) {
  try {
    const { data } = await axios.patch(BASE_URL, payload);
    return data;
  } catch (error) {
    logAxiosError("PATCH /meetings", error);
    throw error;
  }
}

export async function deleteMeeting(id) {
  console.log("=== DELETE Meeting Request ===");
  console.log("Meeting ID yang akan dihapus:", id);
  console.log("URL endpoint:", `${BASE_URL}/${id}`);

  try {
    // Kalau backend support URL param, ubah jadi:
    // const { data } = await axios.delete(`${BASE_URL}/${id}`);

    // Kalau backend belum support URL param, ini versi body:
    const { data } = await axios.delete(BASE_URL, { data: { id } });

    console.log("Response dari DELETE:", data);
    return data;
  } catch (error) {
    logAxiosError("DELETE /meetings", error);
    throw error;
  } finally {
    console.log("=== END DELETE Meeting Request ===");
  }
}



