import prisma from "../../../../../lib/prisma";
import bcrypt from "bcrypt";
import { hash } from "crypto";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const { email, password, name, noTelp, unitId } = body; // Menambahkan unitId untuk employee baru

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email sudah terdaftar, silakan gunakan email lain." },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const setting = await prisma.setting.create({
      data: {},
    });

    // Cek apakah ada employee dengan email yang sama
    const existingEmployee = await prisma.employee.findUnique({
      where: { email },
    });

    // Gunakan transaction untuk memastikan konsistensi data
    const result = await prisma.$transaction(async (tx) => {
      // Buat user baru
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          noTelp,
          unitId,
          settingId: setting.id,
        },
      });

      if (existingEmployee) {
        // Jika employee sudah ada, update employee dengan userId dari user yang baru dibuat
        await tx.employee.update({
          where: { id: existingEmployee.id },
          data: { userId: user.id },
        });

        console.log(
          `User ${user.email} berhasil dikaitkan dengan employee yang sudah ada: ${existingEmployee.id}`
        );
      } else {
        if (!unitId) {
          throw new Error("unitId diperlukan untuk membuat employee baru");
        }

        const newEmployee = await tx.employee.create({
          data: {
            name,
            email,
            userId: user.id,
            unitId,
          },
        });

        console.log(
          `Employee baru berhasil dibuat: ${newEmployee.id} untuk user: ${user.id}`
        );
      }

      return user;
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
      message: "Registrasi akun berhasil!",
      data: {
        userId: result.id,
        email: result.email,
        name: result.name,
        employeeAssociated: !!existingEmployee,
      },
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
