import prisma from "../../../lib/prisma";

export async function GET(req) {
  try {
    const unit = await prisma.unit.findMany({
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
    console.log(body);
    const { name } = body;

    if (!name) {
      return new Response(JSON.stringify({ message: "Isi semua kolom!" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const unit = await prisma.unit.create({
      data: {
        name,
      },
    });

    return new Response(
      JSON.stringify({
        message: "Data Unit berhasil ditambahkan!",
        unit,
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
    const { id, name } = body;

    // Validate required fields
    if (!id || !name) {
      return new Response(JSON.stringify({ message: "Data tidak valid!" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const existingRecord = await prisma.unit.findUnique({
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
    const unit = await prisma.unit.update({
      where: { id },
      data: { name },
    });

    return new Response(
      JSON.stringify({ message: "Data Unit berhasil diubah!", unit }),
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
    const existingRecord = await prisma.unit.findUnique({
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

    await prisma.unit.delete({
      where: { id },
    });

    return new Response(
      JSON.stringify({ message: "Data Unit berhasil dihapus!" }),
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
