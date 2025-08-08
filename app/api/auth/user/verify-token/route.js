import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const body = await req.json();
    const { token } = body;

    // Cek apakah token tersedia
    if (!token) {
      return NextResponse.json(
        { message: "Token tidak ditemukan" },
        { status: 400 }
      );
    }

    // Verifikasi token JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { message: "Token tidak valid atau kadaluarsa" },
        { status: 400 }
      );
    }

    const { id } = decoded;

    // Cek apakah user dengan token ini ada & belum expired
    const user = await prisma.user.findFirst({
      where: {
        id,
        resetToken: token,
        resetTokenExpires: { gte: new Date() }, // Token harus masih berlaku
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          message:
            "Token tidak valid atau sudah kadaluarsa, silahkan ajukan Lupa Password lagi!",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "Token valid" });
  } catch (error) {
    return NextResponse.json(
      { message: "Terjadi kesalahan server", error: error.message },
      { status: 500 }
    );
  }
}
