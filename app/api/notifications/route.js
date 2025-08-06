import { link } from "fs";
import prisma from "../../../lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userIdParam = searchParams.get("user_id");

    let notifications;

    if (userIdParam) {
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
      notifications = await prisma.notification.findMany({
        where: { userId: user_id },
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });
    } else {
      notifications = await prisma.notification.findMany({
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });
    }

    return new Response(JSON.stringify(notifications), {
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

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, title, message } = body;

    if (!userId || !title || !message) {
      return new Response(
        JSON.stringify({
          message: "Data tidak lengkap. Butuh: userId, title, message.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Pastikan user valid
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return new Response(
        JSON.stringify({ message: "User tidak ditemukan." }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const newNotification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
      },
    });

    return new Response(
      JSON.stringify({
        status: "success",
        message: "Notifikasi berhasil dibuat.",
        data: newNotification,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("POST Notification Error:", error);
    return new Response(
      JSON.stringify({
        message: "Gagal membuat notifikasi.",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, read } = body;
    console.log(body);

    if (!id || read === true) {
      return new Response(JSON.stringify({ message: "Invalid data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const existingRecord = await prisma.notification.findUnique({
      where: { id },
    });

    if (!existingRecord) {
      return new Response(JSON.stringify({ message: "Record not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const updatedNotifikasi = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    const responsePayload = {
      status: "success",
      message: "Notifikasi telah terbaca!",
      data: updatedNotifikasi,
    };

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({
        message: "Something went wrong",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
