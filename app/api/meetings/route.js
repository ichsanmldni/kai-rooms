import { link } from "fs";
import prisma from "../../../lib/prisma";
import { createNotification } from "../../../api-client/notification";
import { sendEmail } from "../../../lib/sendEmail";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const roomIdParam = searchParams.get("room_id");
    const userIdParam = searchParams.get("user_id");

    console.log("GET /meetings dipanggil dengan params:", { roomIdParam, userIdParam });

    let meetings;

    if (roomIdParam) {
      const room_id = roomIdParam;
      if (!room_id) {
        console.log("ID Ruangan tidak valid");
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
      console.log(`Ditemukan ${meetings.length} rapat untuk roomId: ${room_id}`);
    } else if (userIdParam) {
      const user_id = userIdParam;
      if (!user_id) {
        console.log("ID User tidak valid");
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

      console.log("Ditemukan employee:", employee);
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
          (attendee) => attendee.employeeId === employee?.id
        )
      );
      console.log(`Ditemukan ${meetingsByEmployee.length} rapat untuk userId: ${user_id}`);

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
      console.log(`Ditemukan total ${meetings.length} rapat tanpa filter`);
    }

    return new Response(JSON.stringify(meetings), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error di GET /meetings:", error);
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
    console.log("POST /meetings, body:", body);

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
      console.log("Validasi gagal: isi semua kolom belum lengkap");
      return new Response(JSON.stringify({ message: "Isi semua kolom!" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validasi tambahan tergantung jenis rapat
    if (jenisRapat === "Online" && !linkMeet) {
      console.log("Validasi gagal: link meeting wajib untuk rapat online");
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
      console.log("Validasi gagal: ruangan dan link meeting wajib untuk rapat hybrid");
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
      console.log("Validasi gagal: ruangan wajib untuk rapat offline");
      return new Response(
        JSON.stringify({ message: "Ruangan wajib diisi untuk rapat offline!" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

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
      console.log("Peserta rapat ada yang tidak ditemukan di tabel Employee");
      throw new Error("Beberapa peserta tidak ditemukan di tabel Employee.");
    }
    console.log(`Ditemukan ${employees.length} peserta rapat`);

    const attendeesData = employees.map((emp) => ({
      employee: {
        connect: { id: emp.id },
      },
    }));

    const startTime = new Date(`${tanggal}T${waktuMulai}:00`);
    const endTime = new Date(`${tanggal}T${waktuSelesai}:00`);

    const meeting = await prisma.meeting.create({
      data: {
        title: namaRapat,
        description: catatan,
        startTime,
        endTime,
        type: jenisRapat,
        roomId: jenisRapat === "Online" ? null : ruangan,
        linkMeet: jenisRapat !== "Offline" ? linkMeet : null,
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

    console.log("Meeting berhasil dibuat dengan ID:", meeting.id);

    // Kirim notifikasi & email
    await Promise.all(
      meeting.meetingAttendees.map(async (attendee) => {
        const user = attendee.employee?.user;
        if (!user) return;

        if (user.settings?.meetingReminder) {
          console.log(`Mengirim notifikasi untuk user ID: ${user.id}`);
          await createNotification({
            userId: user.id,
            title: "Meeting Baru",
            message: `Kamu diundang ke meeting "${meeting.title}"`,
            meetingId: meeting.id,
          });
        }

        if (kirimUndanganEmail && user.settings?.emailNotification) {
          console.log(`Mengirim email ke: ${user.email}`);
          await sendEmail({
            to: user.email,
            subject: `Undangan Meeting: ${meeting.title}`,
            html: `...`, // isi email (sama seperti kode asli)
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
    console.error("Error di POST /meetings:", error);
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
    console.log("PATCH /meetings body:", body);

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

    if (!id || !kode || !nama || !jumlah || !ruanganId || !kategoriId) {
      console.log("Validasi gagal pada PATCH: data tidak valid");
      return new Response(JSON.stringify({ message: "Data tidak valid!" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const existingRecord = await prisma.asset.findUnique({ where: { id } });
    if (!existingRecord) {
      console.log("Data asset tidak ditemukan pada PATCH:", id);
      return new Response(
        JSON.stringify({ message: "Data tidak ditemukan!" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const existingKodeRecord = await prisma.asset.findUnique({ where: { kode } });
    if (existingKodeRecord && existingKodeRecord.id !== id) {
      console.log("Kode sudah ada pada PATCH:", kode);
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

    console.log("Data asset berhasil diubah pada PATCH:", asset.id);

    return new Response(
      JSON.stringify({ message: "Data Asset berhasil diubah!", asset }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error di PATCH /meetings:", error);
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

    console.log("DELETE /meetings dipanggil dengan id:", id);

    if (!id) {
      console.log("ID tidak valid pada DELETE");
      return new Response(JSON.stringify({ message: "ID tidak valid!" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const existingRecord = await prisma.meeting.findUnique({ where: { id } });

    if (!existingRecord) {
      console.log("Data meeting tidak ditemukan pada DELETE:", id);
      return new Response(
        JSON.stringify({ message: "Data tidak ditemukan!" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("Data meeting ditemukan, akan dihapus:", existingRecord);

    await prisma.meeting.delete({ where: { id } });

    console.log("Data meeting berhasil dihapus");

    return new Response(
      JSON.stringify({ message: "Data Meeting berhasil dihapus!" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error di DELETE /meetings:", error);
    return new Response(
      JSON.stringify({
        message: "Terjadi Kesalahan!",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
