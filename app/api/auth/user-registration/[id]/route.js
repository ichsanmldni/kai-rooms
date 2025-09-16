import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma"; // Pastikan path ini benar

export async function GET(request, context) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { message: "ID User Register tidak valid!" },
        { status: 400 }
      );
    }

    const userRegistration = await prisma.userRegistration.findUnique({
      where: { id },
      include: {
        unit: true,
      },
    });

    if (!userRegistration) {
      return NextResponse.json(
        { message: "User Register tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json(userRegistration, { status: 200 });
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
