import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req) {
  const body = await req.json();
  const { token, newPassword } = body;

  // Verifikasi token
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

  // Cek user berdasarkan token
  const user = await prisma.user.findFirst({
    where: { id, resetToken: token },
  });

  if (!user) {
    return NextResponse.json({ message: "Token tidak valid" }, { status: 400 });
  }

  // Hash password baru
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password di database dan hapus token
  await prisma.user.update({
    where: { id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpires: null,
    },
  });

  return NextResponse.json({ message: "Password berhasil diperbarui" });
}
