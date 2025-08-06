import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma"; // Pastikan path ini benar

export async function GET(request, context) {
  try {
    const { id } = context.params;

    if (!id) {
      return NextResponse.json(
        { message: "ID Room tidak valid!" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        settings: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "Terjadi kesalahan server.",
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
