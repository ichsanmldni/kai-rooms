import prisma from "../../../../../lib/prisma";
import bcrypt from "bcrypt";
import { hash } from "crypto";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const { email, password } = body;

    const existingUser = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email sudah terdaftar, silakan gunakan email lain." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { message: "Gagal membuat akun." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 200,
      headers: { "Content-Type": "application/json" },
      message: "Registrasi akun berhasil!",
      data: admin,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "Terjadi Kesalahan!",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}
