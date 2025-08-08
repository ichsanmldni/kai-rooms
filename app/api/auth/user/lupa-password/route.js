import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

export async function POST(req) {
  const body = await req.json();

  const { email } = body;

  if (!email) {
    return new Response(JSON.stringify({ message: "Isi kolom email!" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  // Cek apakah email terdaftar
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json(
      { message: "Tidak ditemukan User dengan Email tersebut!" },
      { status: 404 }
    );
  }

  // Generate token valid 15 menit
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  // Update sesuai dengan tabel yang ditemukan
  await prisma.user.update({
    where: { email },
    data: {
      resetToken: token,
      resetTokenExpires: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  // Kirim email dengan Nodemailer
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const resetLink = `${process.env.NEXT_PUBLIC_API_KAI_OFFICE_BASE_URL}/login/reset-password?token=${token}`;
  await transporter.sendMail({
    from: `"Admin KAI Rooms" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Permintaan Reset Kata Sandi",
    html: `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Kata Sandi - KAI Rooms</title>
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
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🚆 KAI Rooms</div>
          <h1>Reset Kata Sandi</h1>
        </div>
        
        <div class="content">
          <div class="greeting">Halo! 👋</div>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Kami menerima permintaan untuk mereset kata sandi akun KAI Rooms Anda. Untuk melanjutkan proses ini, silakan klik tombol di bawah.
          </p>
          
          <div style="text-align: center;">
            <a href="${resetLink}" class="link-button">
              Atur Ulang Kata Sandi
            </a>
          </div>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; text-align: center;">
            Atau, salin dan tempel tautan ini di browser Anda:<br>
            <a href="${resetLink}" style="color: #1e40af; word-break: break-all;">${resetLink}</a>
          </p>

          <p style="color: #ef4444; font-size: 14px; font-weight: 600; text-align: center; margin-top: 20px;">
            Tautan ini akan kedaluwarsa dalam 1 jam.
          </p>

          <div class="divider"></div>
          
          <p style="color: #64748b; font-size: 14px; font-style: italic; text-align: center;">
            Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini. Kata sandi Anda tidak akan diubah.
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

  return NextResponse.json({ message: "Cek email untuk reset password" });
}
