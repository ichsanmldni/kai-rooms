import prisma from "../../../lib/prisma";
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date"); // format: YYYY-MM-DD
    const roomId = searchParams.get("room_id");

    if (!date || !roomId) {
      return new Response(
        JSON.stringify({ message: "Tanggal dan Room ID wajib!" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const startOfDay = new Date(`${date}T00:00:00`);
    const endOfDay = new Date(`${date}T23:59:59`);

    const meetings = await prisma.meeting.findMany({
      where: {
        roomId,
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    // Ubah meetings jadi array slot waktu yang "booked"
    const booked = meetings.map((m) => {
      const jam = m.startTime.toTimeString().slice(0, 5); // ambil HH:MM
      return jam;
    });

    return new Response(JSON.stringify({ booked }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Terjadi Kesalahan!",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
