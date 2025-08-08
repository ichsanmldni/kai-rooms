import prisma from "../../../lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const unitIdParam = searchParams.get("unit_id");
    const userIdParam = searchParams.get("user_id");

    let employee;

    if (unitIdParam && userIdParam) {
      const user_id = userIdParam;
      const unit_id = unitIdParam;
      if (!user_id) {
        return new Response(
          JSON.stringify({ message: "ID User tidak valid!" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      if (!unit_id) {
        return new Response(
          JSON.stringify({ message: "ID Unit tidak valid!" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      employee = await prisma.employee.findMany({
        where: { userId: user_id, unitId: unit_id },
        include: {
          user: true,
          unit: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
    } else if (unitIdParam) {
      const unit_id = unitIdParam;
      if (!unit_id) {
        return new Response(
          JSON.stringify({ message: "ID Unit tidak valid!" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      employee = await prisma.employee.findMany({
        where: { unitId: unit_id },
        include: {
          user: true,
          unit: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
    } else if (userIdParam) {
      const user_id = userIdParam;
      if (!user_id) {
        return new Response(
          JSON.stringify({ message: "ID User tidak valid!" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      employee = await prisma.employee.findUnique({
        where: { userId: user_id },
        include: {
          user: true,
          unit: true,
        },
      });
    } else {
      employee = await prisma.employee.findMany({
        include: {
          user: true,
          unit: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
    }

    return new Response(JSON.stringify(employee), {
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
    const { name, email, unitId } = body;

    if ((!name || !email, !unitId)) {
      return new Response(JSON.stringify({ message: "Isi semua kolom!" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const existingKodeRecord = await prisma.employee.findUnique({
      where: {
        email,
      },
    });

    if (existingKodeRecord) {
      return new Response(
        JSON.stringify({ message: "Email tersebut sudah dipakai!" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const employee = await prisma.employee.create({
      data: {
        name,
        email,
        unitId,
      },
    });

    return new Response(
      JSON.stringify({
        message: "Data Employee berhasil ditambahkan!",
        employee,
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
    const { id, name, email, unitId } = body;

    // Validate required fields
    if (!id || !name || !email || !unitId) {
      return new Response(JSON.stringify({ message: "Data tidak valid!" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const existingRecord = await prisma.employee.findUnique({
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

    const existingKodeRecord = await prisma.employee.findUnique({
      where: {
        email,
      },
    });

    if (existingKodeRecord && existingKodeRecord.id !== id) {
      return new Response(
        JSON.stringify({ message: "Email tersebut sudah ada yg pakai!" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: { name, email, unitId },
    });

    return new Response(
      JSON.stringify({ message: "Data Employee berhasil diubah!", employee }),
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
    const existingRecord = await prisma.employee.findUnique({
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

    await prisma.employee.delete({
      where: { id },
    });

    return new Response(
      JSON.stringify({ message: "Data Employee berhasil dihapus!" }),
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
