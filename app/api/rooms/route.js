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
      orderBy: {
        updatedAt: "desc",
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

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, location, capacity } = body;

    if (!name || !location || !capacity) {
      return new Response(JSON.stringify({ message: "Isi semua kolom!" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const room = await prisma.room.create({
      data: {
        name,
        location,
        capacity,
      },
    });

    return new Response(
      JSON.stringify({
        message: "Data Ruangan berhasil ditambahkan!",
        room,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
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

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, name, capacity, location } = body;

    console.log("ini body", body);
    // Validate required fields
    if (
      !id ||
      !name ||
      capacity === null ||
      capacity === undefined ||
      !location
    ) {
      return new Response(JSON.stringify({ message: "Data tidak valid!" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const existingRecord = await prisma.room.findUnique({
      where: { id },
    });

    if (!existingRecord) {
      return new Response(
        JSON.stringify({ message: "Data tidak ditemukan!" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    const room = await prisma.room.update({
      where: { id },
      data: { name, capacity, location },
    });

    return new Response(
      JSON.stringify({ message: "Data Ruangan berhasil diubah!", room }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
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

export async function DELETE(req) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return new Response(JSON.stringify({ message: "ID tidak valid!" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Ambil record yang mau dihapus
    const existingRecord = await prisma.room.findUnique({
      where: { id },
    });

    if (!existingRecord) {
      return new Response(
        JSON.stringify({ message: "Data tidak ditemukan!" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    await prisma.room.delete({
      where: { id },
    });

    return new Response(
      JSON.stringify({ message: "Data Ruangan berhasil dihapus!" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
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
