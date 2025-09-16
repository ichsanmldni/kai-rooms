import prisma from "../../../lib/prisma";

export async function GET(req) {
  try {
    const unit = await prisma.termsCondition.findMany({
      orderBy: {
        createdAt: "asc",
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
    const { title, content, isActive } = body;
    console.log(body);

    if (!title || !content || isActive === null || isActive === undefined) {
      console.log("masuk");
      return new Response(JSON.stringify({ message: "Isi semua kolom!" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const termsCondition = await prisma.termsCondition.create({
      data: {
        title,
        content,
        isActive,
      },
    });

    return new Response(
      JSON.stringify({
        message: "Data Terms & Condition berhasil ditambahkan!",
        termsCondition,
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
    const { id, title, content, isActive } = body;

    console.log("ini body", body);
    // Validate required fields
    if (
      !id ||
      !title ||
      !content ||
      isActive === undefined ||
      isActive === null
    ) {
      return new Response(JSON.stringify({ message: "Data tidak valid!" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const existingRecord = await prisma.termsCondition.findUnique({
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
    const termsCondition = await prisma.termsCondition.update({
      where: { id },
      data: { title, content, isActive },
    });

    return new Response(
      JSON.stringify({
        message: "Data Terms & Condition berhasil diubah!",
        termsCondition,
      }),
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
    const existingRecord = await prisma.termsCondition.findUnique({
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

    await prisma.termsCondition.delete({
      where: { id },
    });

    return new Response(
      JSON.stringify({ message: "Data Terms & Condition berhasil dihapus!" }),
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
