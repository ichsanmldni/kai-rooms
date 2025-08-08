import { link } from "fs";
import prisma from "../../../lib/prisma";
import { createNotification } from "../../../api-client/notification";
import { sendEmail } from "../../../lib/sendEmail";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const roomIdParam = searchParams.get("room_id");
    const userIdParam = searchParams.get("user_id");

    let meetings;

    if (roomIdParam) {
      const room_id = roomIdParam;
      if (!room_id) {
        return new Response(
          JSON.stringify({ message: "ID Ruangan tidak valid!" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      meetings = await prisma.meeting.findMany({
        where: { roomId: room_id },
        include: {
          room: true,
          organizerUnit: true,
          meetingAttendees: true,
        },
        orderBy: {
          startTime: "asc",
        },
      });
    } else if (userIdParam) {
      const user_id = userIdParam;
      if (!user_id) {
        return new Response(
          JSON.stringify({ message: "ID User tidak valid!" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      const employee = await prisma.employee.findUnique({
        where: { userId: user_id },
      });

      console.log("ini employee", employee);
      meetings = await prisma.meeting.findMany({
        include: {
          room: true,
          organizerUnit: true,
          meetingAttendees: true,
        },
        orderBy: {
          startTime: "asc",
        },
      });

      const meetingsByEmployee = meetings.filter((meeting) =>
        meeting.meetingAttendees.some(
          (attendee) => attendee.employeeId === employee.id
        )
      );
      return new Response(JSON.stringify(meetingsByEmployee), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      meetings = await prisma.meeting.findMany({
        include: {
          room: true,
          organizerUnit: true,
          meetingAttendees: true,
        },
        orderBy: {
          startTime: "asc",
        },
      });
    }

    return new Response(JSON.stringify(meetings), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
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

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      catatan,
      jenisRapat,
      kirimUndanganEmail,
      linkMeet,
      lokasi,
      namaRapat,
      penyelenggara,
      pesertaRapat, // array of employeeId
      ruangan,
      tanggal,
      waktuMulai,
      waktuSelesai,
      createdById,
    } = body;

    console.log("ini body", body);

    // Validasi input
    if (
      !namaRapat ||
      !jenisRapat ||
      !penyelenggara ||
      !tanggal ||
      !waktuMulai ||
      !waktuSelesai ||
      !createdById
    ) {
      return new Response(JSON.stringify({ message: "Isi semua kolom!" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 🔽 Validasi tambahan tergantung jenis rapat
    if (jenisRapat === "Online" && !linkMeet) {
      return new Response(
        JSON.stringify({
          message: "Link meeting wajib diisi untuk rapat online!",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (jenisRapat === "Hybrid" && (!ruangan || !linkMeet)) {
      return new Response(
        JSON.stringify({
          message: "Ruangan dan link meeting wajib diisi untuk rapat hybrid!",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (jenisRapat === "Offline" && !ruangan) {
      return new Response(
        JSON.stringify({ message: "Ruangan wajib diisi untuk rapat offline!" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Ambil data employee beserta user-nya
    const employees = await prisma.employee.findMany({
      where: {
        id: {
          in: pesertaRapat,
        },
      },
      include: {
        user: {
          include: {
            settings: true,
          },
        },
      },
    });

    if (employees.length !== pesertaRapat.length) {
      throw new Error("Beberapa peserta tidak ditemukan di tabel Employee.");
    }

    const attendeesData = employees.map((emp) => ({
      employee: {
        connect: { id: emp.id },
      },
    }));

    const startTime = new Date(`${tanggal}T${waktuMulai}:00`);
    const endTime = new Date(`${tanggal}T${waktuSelesai}:00`);

    // Simpan data rapat
    const meeting = await prisma.meeting.create({
      data: {
        title: namaRapat,
        description: catatan,
        startTime,
        endTime,
        type: jenisRapat,
        roomId: jenisRapat === "Online" ? null : ruangan,
        linkMeet: jenisRapat !== "Offline" ? linkMeet : null, // 🟢 hanya untuk Online & Hybrid
        createdById,
        organizerUnitId: penyelenggara,
        meetingAttendees: {
          create: attendeesData,
        },
      },
      include: {
        meetingAttendees: {
          include: {
            employee: {
              include: {
                user: {
                  include: {
                    settings: true,
                  },
                },
              },
            },
          },
        },
        room: true,
      },
    });

    // Kirim notifikasi & email ke semua peserta
    await Promise.all(
      meeting.meetingAttendees.map(async (attendee) => {
        const user = attendee.employee?.user;
        if (!user) return;

        // 1. Notifikasi dalam sistem
        if (user.settings?.meetingReminder) {
          await createNotification({
            userId: user.id,
            title: "Meeting Baru",
            message: `Kamu diundang ke meeting "${meeting.title}"`,
            meetingId: meeting.id,
          });
        }

        // 2. Email undangan (jika diaktifkan dan flag kirimUndanganEmail = true)
        if (kirimUndanganEmail && user.settings?.emailNotification) {
          await sendEmail({
            to: user.email,
            subject: `Undangan Meeting: ${meeting.title}`,
            html: `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Undangan Meeting - KAI Rooms</title>
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
        .meeting-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-left: 4px solid #1e3a8a;
          border-radius: 12px;
          padding: 24px;
          margin: 24px 0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .meeting-title {
          font-size: 22px;
          font-weight: 700;
          color: #1e3a8a;
          margin-bottom: 18px;
          line-height: 1.3;
        }
        .meeting-details {
          display: grid;
          gap: 12px;
        }
        .detail-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .detail-label {
          font-weight: 600;
          color: #374151;
          min-width: 90px;
        }
        .detail-value {
          color: #1f2937;
          font-weight: 500;
        }
        .room-info {
          background: #ffffff;
          border: 1px solid #fbbf24;
          border-left: 4px solid #f59e0b;
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .room-title {
          font-weight: 700;
          color: #92400e;
          margin-bottom: 12px;
          font-size: 18px;
          display: flex;
          align-items: center;
          gap: 8px;
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
          margin: 20px 0;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(5, 150, 105, 0.25);
          letter-spacing: 0.3px;
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
        .system-link {
          color: #1e40af;
          text-decoration: none;
          font-weight: 600;
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
          <h1>Undangan Meeting</h1>
        </div>
        
        <div class="content">
          <div class="greeting">Halo ${user.name}! 👋</div>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Anda telah diundang untuk menghadiri meeting yang telah dijadwalkan melalui sistem KAI Rooms.
          </p>
          
          <div class="meeting-card">
            <div class="meeting-title">${meeting.title}</div>
            <div class="meeting-details">
              <div class="detail-item">
                <span class="detail-label">Waktu:</span>
                <span class="detail-value">${new Date(
                  meeting.startTime
                ).toLocaleString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}</span>
              </div>
              
              ${
                meeting.endTime
                  ? `
              <div class="detail-item">
                <span class="detail-label">Selesai:</span>
                <span class="detail-value">${new Date(
                  meeting.endTime
                ).toLocaleString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}</span>
              </div>
              `
                  : ""
              }
            </div>
          </div>
          
          ${
            meeting.room || lokasi
              ? `
          <div class="room-info">
            <div class="room-title">📍 Informasi Ruangan</div>
            <div class="detail-value">
              ${
                meeting.room?.name
                  ? `<strong>Ruangan:</strong> ${meeting.room.name}<br>`
                  : ""
              }
              ${
                meeting.room?.capacity
                  ? `<strong>Kapasitas:</strong> ${meeting.room.capacity} orang<br>`
                  : ""
              }
              ${lokasi ? `<strong>Lokasi:</strong> ${lokasi}<br>` : ""}
              ${
                meeting.room?.facilities
                  ? `<strong>Fasilitas:</strong> ${meeting.room.facilities}<br>`
                  : ""
              }
              <small style="color: #92400e; display: block; margin-top: 8px;">
                *Harap datang 10 menit sebelum meeting dimulai
              </small>
            </div>
          </div>
          `
              : ""
          }
          
          ${
            linkMeet
              ? `
          <div style="text-align: center; margin: 25px 0;">
            <a href="${linkMeet}" class="link-button">
              🎥 Bergabung ke Meeting
            </a>
          </div>
          `
              : ""
          }
          
          <div class="divider"></div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #374151; font-size: 15px; margin: 0; line-height: 1.6;">
              <strong>📋 Petunjuk:</strong><br>
              • Hubungi penyelenggara jika ada pertanyaan
            </p>
          </div>
          
          <p style="color: #64748b; font-size: 13px; font-style: italic;">
            Email ini dikirim secara otomatis dari sistem KAI Rooms. 
            Jika Anda memiliki pertanyaan, hubungi administrator sistem.
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
        }
      })
    );

    return new Response(
      JSON.stringify({ message: "Rapat berhasil dibuat!", meeting }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        message: "Terjadi kesalahan!",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json();
    const {
      id,
      kode,
      nama,
      jumlah,
      deskripsi,
      keterangan,
      ruanganId,
      kategoriId,
    } = body;

    // Validate required fields
    if (!id || !kode || !nama || !jumlah || !ruanganId || !kategoriId) {
      return new Response(JSON.stringify({ message: "Data tidak valid!" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const existingRecord = await prisma.asset.findUnique({
      where: { id },
    });

    if (!existingRecord) {
      return new Response(
        JSON.stringify({ message: "Data tidak ditemukan!" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const existingKodeRecord = await prisma.asset.findUnique({
      where: {
        kode,
      },
    });

    if (existingKodeRecord && existingKodeRecord.id !== id) {
      return new Response(
        JSON.stringify({ message: "Kode tersebut sudah ada!" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const asset = await prisma.asset.update({
      where: { id },
      data: {
        kode,
        nama,
        jumlah,
        deskripsi,
        keterangan,
        ruanganId,
        kategoriId,
      },
    });

    return new Response(
      JSON.stringify({ message: "Data Asset berhasil diubah!", asset }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({
        message: "Terjadi Kesalahan!",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function DELETE(req) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return new Response(JSON.stringify({ message: "ID tidak valid!" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const existingRecord = await prisma.asset.findUnique({
      where: { id },
    });

    if (!existingRecord) {
      return new Response(
        JSON.stringify({ message: "Data tidak ditemukan!" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const deletedOrder = existingRecord.order;

    // Jalankan transaksi:
    await prisma.$transaction([
      // Hapus data
      prisma.asset.delete({
        where: { id },
      }),
      // Kurangi 1 order semua gedung yang order-nya di atas item yang dihapus
      prisma.asset.updateMany({
        where: {
          ruanganId: existingRecord.ruanganId,
          order: {
            gt: deletedOrder, // order lebih besar dari yang dihapus
          },
        },
        data: {
          order: {
            decrement: 1,
          },
        },
      }),
    ]);

    return new Response(
      JSON.stringify({ message: "Data Asset berhasil dihapus!" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Terjadi Kesalahan!",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
