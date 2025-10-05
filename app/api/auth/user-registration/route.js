import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { sendEmail } from "../../../../lib/sendEmail";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    let userRegistration;

    userRegistration = await prisma.userRegistration.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        nipp: true,
        status: true,
        unit: true,
      },
    });

    userRegistration.sort((a, b) => {
      if (a.status === "PENDING" && b.status !== "PENDING") return -1;
      if (a.status !== "PENDING" && b.status === "PENDING") return 1;
      return 0;
    });

    return new Response(JSON.stringify(userRegistration), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.log(error);
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

// PATCH /api/user
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, email, password, nipp, status, name, unitId } = body;

    console.log(body);

    console.log(body);

    if (!id || !status || !password || !email || !nipp || !name || !unitId) {
      return new Response(JSON.stringify({ message: "Data tidak valid!" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const existingUserRegistration = await prisma.userRegistration.findUnique({
      where: { id },
    });
    if (!existingUserRegistration) {
      return new Response(
        JSON.stringify({ message: "User Pendaftar tidak ditemukan!" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const existingEmployee = await prisma.employee.findUnique({
      where: { email },
    });

    if (status === "APPROVED") {
      await prisma.userRegistration.update({
        where: { id },
        data: {
          status,
        },
      });
      const result = await prisma.$transaction(async (tx) => {
        // Buat setting kosong
        const setting = await prisma.setting.create({ data: {} });

        // Buat user baru
        const user = await tx.user.create({
          data: {
            email,
            name,
            nipp,
            unitId,
            password,
            settingId: setting.id,
          },
        });
        const existingEmployee = await prisma.employee.findUnique({
          where: { nipp },
        });

        // Jika employee sudah ada → update
        if (existingEmployee) {
          await tx.employee.update({
            where: { id: existingEmployee.id },
            data: { userId: user.id },
          });
        } else {
          // Kalau employee belum ada → buat baru
          if (!unitId) {
            throw new Error("unitId diperlukan untuk membuat employee baru");
          }
          await tx.employee.create({
            data: {
              name,
              email,
              userId: user.id,
              unitId,
              nipp,
            },
          });
        }

        return user;
      });

      if (!result) {
        return NextResponse.json(
          { message: "Gagal membuat akun." },
          { status: 500 }
        );
      }

      // Kirim email konfirmasi pendaftaran
      // VERSI LENGKAP (Professional Email Template)
      try {
        await sendEmail({
          to: email,
          subject: "🎉 Akun Anda Berhasil Divalidasi Admin!",
          html: `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Validasi Berhasil, Silahkan Login Menggunakan Akun Anda!</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
              🎉 Selamat Datang!
            </h1>
            <p style="color: #e8f0fe; margin: 10px 0 0 0; font-size: 16px;">
              Validasi akun Anda berhasil !
            </p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px; font-weight: 500;">
              Halo ${name}! 👋
            </h2>
        Selamat datang di KAI OFFICE!
            
        
            
          
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="color: #6c757d; margin: 0 0 10px 0; font-size: 14px;">
              Jika Anda membutuhkan bantuan, jangan ragu untuk menghubungi kami.
            </p>
            <p style="color: #6c757d; margin: 0; font-size: 12px;">
              Email ini dikirim secara otomatis, mohon tidak membalas email ini.
            </p>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6;">
              <p style="color: #adb5bd; margin: 0; font-size: 12px;">
                © ${new Date().getFullYear()} Your Company Name. All rights reserved.
              </p>
            </div>
          </div>
          
        </div>
      </body>
      </html>
    `,
        });
      } catch (emailError) {
        console.error("Gagal mengirim email:", emailError);
      }
      return NextResponse.json({
        status: 200,
        headers: { "Content-Type": "application/json" },
        message: "Validasi Akun Berhasil!",
        data: {
          userId: result.id,
          email: result.email,
          name: result.name,
          employeeAssociated: !!existingEmployee,
        },
      });
    } else if (status === "REJECTED") {
      await prisma.userRegistration.update({
        where: { id },
        data: {
          status,
        },
      });
      return new Response(
        JSON.stringify({
          message: "Permohonan Validasi Akun User Pendaftar Berhasil Ditolak!",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        message: "Terjadi Kesalahan!",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
