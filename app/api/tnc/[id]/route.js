import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma"; // Pastikan path ini benar

export async function GET(request, context) {
  try {
    const { id } = context.params;

    if (!id) {
      return NextResponse.json(
        { message: "ID TNC tidak valid!" },
        { status: 400 }
      );
    }

    const tnc = await prisma.termsCondition.findUnique({
      where: { id },
    });

    if (!tnc) {
      return NextResponse.json(
        { message: "Terms and Condition tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json(tnc, { status: 200 });
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
