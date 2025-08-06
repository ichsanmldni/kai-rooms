import prisma from "../../../lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userIdParam = searchParams.get("user_id");

    console.log("ini userid param", userIdParam);

    let setting;

    if (userIdParam) {
      // Ambil semua settings + user
      const settings = await prisma.setting.findMany({
        include: {
          user: true,
        },
      });

      console.log("ini settings", settings);

      // Cari setting dengan user.id yang sesuai
      setting = settings.find((s) => s.user?.id === userIdParam);

      console.log("ini setting", setting);
      if (!setting) {
        return new Response(
          JSON.stringify({
            message: `Setting untuk user_id ${userIdParam} tidak ditemukan.`,
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      return new Response(JSON.stringify(setting), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      // Kalau tidak ada user_id, kembalikan semua
      const allSettings = await prisma.setting.findMany({
        include: {
          user: true,
        },
      });

      return new Response(JSON.stringify(allSettings), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("GET /setting error:", error);
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
    const { id, emailNotification, meetingReminder } = body;

    console.log(body);

    if (
      !id ||
      emailNotification === null ||
      emailNotification === undefined ||
      meetingReminder === null ||
      meetingReminder === undefined
    ) {
      return new Response(JSON.stringify({ message: "Data tidak valid!" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(id);

    const existingSetting = await prisma.setting.findUnique({ where: { id } });
    if (!existingSetting) {
      return new Response(
        JSON.stringify({ message: "Setting tidak ditemukan!" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Update data User
    const updatedSetting = await prisma.setting.update({
      where: { id },
      data: {
        emailNotification,
        meetingReminder,
      },
    });

    return new Response(
      JSON.stringify({
        message: "Setting berhasil diubah!",
        setting: updatedSetting,
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
