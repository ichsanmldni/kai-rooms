import prisma from "../../../../../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { sendEmail } from "../../../../../lib/sendEmail"; // pastikan path sesuai

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, name, nipp, unitId, password } = body;
    console.log(body);

    // Cek apakah user sudah terdaftar
    let resetLink;
    const existingEmailUser = await prisma.user.findUnique({
      where: { email },
    });
    const existingNippUser = await prisma.user.findUnique({ where: { nipp } });
    if (existingEmailUser || existingNippUser) {
      return NextResponse.json(
        {
          message: "Employee dengan Email atau NIPP tersebut sudah terdaftar.",
        },
        { status: 400 }
      );
    }
    const existingEmailUserRegistration =
      await prisma.userRegistration.findUnique({
        where: { email },
      });
    const existingNippUserRegistration =
      await prisma.userRegistration.findUnique({ where: { nipp } });
    if (existingEmailUserRegistration || existingNippUserRegistration) {
      return NextResponse.json(
        {
          message:
            "User dengan Email atau NIPP tersebut sudah pernah mendaftar.",
        },
        { status: 400 }
      );
    }

    // Cek apakah employee sudah ada
    const existingEmployee = await prisma.employee.findUnique({
      where: { nipp },
    });

    // Gunakan transaksi supaya data konsisten
    const result = await prisma.$transaction(async (tx) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      // Buat user baru
      const userRegistration = await tx.userRegistration.create({
        data: {
          email,
          name,
          nipp,
          unitId,
          password: hashedPassword,
        },
      });

      return userRegistration;
    });

    if (!result) {
      return NextResponse.json(
        { message: "Gagal membuat akun." },
        { status: 500 }
      );
    }
    return NextResponse.json({
      status: 200,
      headers: { "Content-Type": "application/json" },
      message:
        "Registrasi akun berhasil, tunggu admin menyatakan akun anda valid untuk login. Cek email anda secara berkala untuk notifikasi akun anda sudah divalidasi Admin!",
      data: {
        userId: result.id,
        email: result.email,
        name: result.name,
        employeeAssociated: !!existingEmployee,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: "Terjadi Kesalahan!",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
