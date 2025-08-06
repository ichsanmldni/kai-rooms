import prisma from "../../../lib/prisma";

export async function GET(req) {
  try {
    const unit = await prisma.room.findMany({
      include: {
        meetings: {
          include: {
            createdBy: true,
            meetingAttendees: true,
            organizerUnit: true,
          },
        },
      },
    });

    return new Response(JSON.stringify(unit), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({
        message: "Terjadi Kesalahan!",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
