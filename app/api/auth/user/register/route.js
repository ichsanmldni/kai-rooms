import prisma from "../../../../../lib/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { sendEmail } from "../../../../../lib/sendEmail"; // pastikan path sesuai

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password, name, noTelp, unitId, nipp } = body;

    // Cek apakah user sudah terdaftar
    const existingEmailUser = await prisma.user.findUnique({ where: { email } });
    const existingNippUser = await prisma.user.findUnique({ where: { nipp } });
    if (existingEmailUser) {
      return NextResponse.json(
        { message: "Email sudah terdaftar, silakan gunakan email lain." },
        { status: 400 }
      );
    }

    // Enkripsi password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat setting kosong
    const setting = await prisma.setting.create({ data: {} });

    // Cek apakah employee sudah ada
    const existingEmployee = await prisma.employee.findUnique({
      where: { email },
    });

    // Gunakan transaksi supaya data konsisten
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
    subject: "🎉 Registrasi Akun Berhasil - Selamat Datang!",
    html: `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registrasi Berhasil</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
              🎉 Selamat Datang!
            </h1>
            <p style="color: #e8f0fe; margin: 10px 0 0 0; font-size: 16px;">
              Registrasi akun Anda berhasil
            </p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px; font-weight: 500;">
              Halo ${name}! 👋
            </h2>
            
            <p style="color: #555555; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
              Terima kasih telah mendaftar! Akun Anda telah berhasil dibuat dan siap digunakan.
            </p>
            
            <!-- Info Box -->
            <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
              <h3 style="color: #333333; margin: 0 0 10px 0; font-size: 18px;">
                📧 Informasi Login
              </h3>
              <p style="color: #666666; margin: 0; font-size: 14px;">
                <strong>Email:</strong> <span style="color: #667eea; font-weight: 600;">${email}</span>
              </p>
            </div>
            
            <p style="color: #555555; line-height: 1.6; margin: 20px 0; font-size: 16px;">
              Anda sekarang dapat login menggunakan email dan password yang telah Anda daftarkan.
            </p>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="#" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 10px rgba(102, 126, 234, 0.3); transition: all 0.3s ease;">
                🚀 Masuk ke Akun
              </a>
            </div>
            
            <!-- Tips Section -->
            <div style="background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%); padding: 20px; border-radius: 10px; margin: 25px 0;">
              <h3 style="color: #2d3436; margin: 0 0 10px 0; font-size: 16px;">
                💡 Tips Keamanan
              </h3>
              <ul style="color: #2d3436; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.5;">
                <li>Jangan bagikan password Anda kepada siapapun</li>
                <li>Logout setelah selesai menggunakan akun</li>
                <li>Gunakan password yang kuat dan unik</li>
              </ul>
            </div>
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

// VERSI SEDERHANA (Simple Clean Template)

try {
  await sendEmail({
    from: `"Admin KAI Rooms" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Registrasi Akun Berhasil - KAI Rooms",
    html: `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registrasi Berhasil - KAI Rooms</title>
        <style>
          body {
            font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            margin: 0;
            padding: 20px;
            background-color: #f9fafb;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #1e3a8a, #1d4ed8);
            color: white;
            padding: 32px 30px;
            text-align: center;
            position: relative;
          }
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
            opacity: 0.1;
          }
          .header h1 {
            margin: 0;
            font-size: 26px;
            font-weight: 700;
            position: relative;
            z-index: 1;
          }
          .logo {
            font-size: 20px;
            font-weight: 800;
            margin-bottom: 12px;
            position: relative;
            z-index: 1;
            letter-spacing: 0.5px;
          }
          .content {
            padding: 30px;
          }
          .greeting {
            font-size: 20px;
            color: #1e3a8a;
            margin-bottom: 20px;
            font-weight: 700;
          }
          .info-card {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-left: 4px solid #1e3a8a;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          .info-title {
            font-size: 22px;
            font-weight: 700;
            color: #1e3a8a;
            margin-bottom: 18px;
            line-height: 1.3;
          }
          .link-button {
            display: inline-block;
            background: linear-gradient(135deg, #059669, #047857);
            color: white !important;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 10px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px auto;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(5, 150, 105, 0.25);
            letter-spacing: 0.3px;
            text-align: center;
            width: fit-content;
          }
          .link-button:hover {
            background: linear-gradient(135deg, #047857, #065f46);
            box-shadow: 0 6px 12px rgba(5, 150, 105, 0.35);
            transform: translateY(-1px);
          }
          .footer {
            background-color: #f8fafc;
            padding: 25px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 14px;
          }
          .divider {
            height: 2px;
            background: linear-gradient(90deg, #1e40af, #3b82f6, #1e40af);
            margin: 20px 0;
            border-radius: 1px;
          }
          .success-badge {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            display: inline-block;
            margin-bottom: 15px;
          }
          .security-tips {
            background: #fef3c7;
            border: 1px solid #fbbf24;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .security-tips h4 {
            color: #92400e;
            margin: 0 0 12px 0;
            font-size: 16px;
            font-weight: 600;
          }
          .security-tips ul {
            margin: 0;
            padding-left: 20px;
            color: #78350f;
            font-size: 14px;
          }
          .security-tips li {
            margin-bottom: 6px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🚆 KAI Rooms</div>
            <h1>🎉 Selamat Datang!</h1>
          </div>
          
          <div class="content">
            <div class="greeting">Halo ${name}! 👋</div>
            
            <div style="text-align: center; margin-bottom: 20px;">
              <span class="success-badge">✅ Registrasi Berhasil</span>
            </div>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              Selamat! Akun KAI Rooms Anda telah berhasil dibuat dan siap digunakan. Anda sekarang dapat mengakses sistem manajemen ruang meeting kami.
            </p>
            
            <div class="info-card">
              <div class="info-title">Informasi Akun Anda</div>
              <p style="margin: 0; color: #374151; font-size: 16px;">
                <strong>Email Login:</strong> <span style="color: #1e3a8a; font-weight: 600;">${email}</span>
              </p>
            </div>
            
          <div style="text-align: center;">
            <a href="http://localhost:3000" class="link-button">
              Masuk ke KAI Rooms
            </a>
          </div>

            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; text-align: center;">
              Gunakan email dan password yang telah Anda daftarkan untuk login ke sistem.
            </p>

            <div class="security-tips">
              <h4>💡 Tips Keamanan Akun</h4>
              <ul>
                <li>Jangan bagikan password Anda kepada siapapun</li>
                <li>Selalu logout setelah selesai menggunakan sistem</li>
                <li>Gunakan password yang kuat dan unik</li>
                <li>Laporkan aktivitas mencurigakan kepada admin</li>
              </ul>
            </div>

            <div class="divider"></div>
            
            <p style="color: #64748b; font-size: 14px; font-style: italic; text-align: center;">
              Jika Anda membutuhkan bantuan atau memiliki pertanyaan, silakan hubungi tim support KAI Rooms kami.
            </p>
          </div>
          
          <div class="footer">
            <div style="margin-bottom: 10px;">
              <strong>PT Kereta Api Indonesia</strong>
            </div>
            <div>Sistem Manajemen Ruang Meeting KAI Rooms</div>
            <div style="margin-top: 10px; font-size: 12px;">
              © ${new Date().getFullYear()} PT Kereta Api Indonesia. All rights reserved.
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
      message: "Registrasi akun berhasil!",
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
