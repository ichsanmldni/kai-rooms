import prisma from "../../../../lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const settingIdParam = searchParams.get("setting_id");

    let user;

    if (settingIdParam) {
      const setting_id = settingIdParam;
      if (!setting_id) {
        return new Response(
          JSON.stringify({ message: "ID Setting tidak valid!" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      user = await prisma.user.findMany({
        where: { settingId: setting_id },
        include: {
          settings: true,
          employee: true,
        },
      });
    } else {
      user = await prisma.user.findMany({
        include: {
          settings: true,
          employee: true,
        },
      });
    }

    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handling errors
    return new Response(
      JSON.stringify({
        message: "Terjadi Kesalahan!",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// PATCH /api/user
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, email, nama, noTelp } = body;

    console.log(body);

    if (!id || !email || !nama || !noTelp) {
      return new Response(JSON.stringify({ message: "Data tidak valid!" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return new Response(
        JSON.stringify({ message: "User tidak ditemukan!" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const emailUsed = await prisma.user.findUnique({ where: { email } });
    if (emailUsed && emailUsed.id !== id) {
      return new Response(
        JSON.stringify({ message: "Email tersebut sudah digunakan!" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Update data User
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        email,
        name: nama,
        noTelp,
      },
    });

    // Cari dan update Employee (jika ada)
    const relatedEmployee = await prisma.employee.findUnique({
      where: { userId: id },
    });

    let updatedEmployee = null;

    if (relatedEmployee) {
      updatedEmployee = await prisma.employee.update({
        where: { id: relatedEmployee.id },
        data: {
          email, // Update ke email baru user
          name: nama, // Sinkronkan nama
          // Jika ingin update noTelp juga ke employee, pastikan field itu ada
        },
      });
    }

    return new Response(
      JSON.stringify({
        message: "Data User & Employee berhasil diubah!",
        user: updatedUser,
        employee: updatedEmployee,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        message: "Terjadi Kesalahan!",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
