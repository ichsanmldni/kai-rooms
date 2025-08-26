import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const body = await req.json();

    // Cek apakah token tersedia
    if (!body) {
      return NextResponse.json(
        { message: "Token tidak ditemukan" },
        { status: 400 }
      );
    }

    // Verifikasi token JWT
    let decoded;
    try {
      decoded = jwt.verify(body, process.env.JWT_SECRET);
    } catch (err) {
      console.log("ini kah");
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
        resetToken: body,
        resetTokenExpires: { gte: new Date() }, // Token harus masih berlaku
      },
    });

    if (!user) {
      console.log("ini kahh");
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
    console.log(error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server", error: error.message },
      { status: 500 }
    );
  }
}
