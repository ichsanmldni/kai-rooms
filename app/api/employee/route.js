import prisma from "../../../lib/prisma";

import { sendEmail } from "../../../lib/sendEmail";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const unitIdParam = searchParams.get("unit_id");
    const userIdParam = searchParams.get("user_id");

    let employee;

    if (unitIdParam && userIdParam) {
      const user_id = userIdParam;
      const unit_id = unitIdParam;
      if (!user_id) {
        return new Response(
          JSON.stringify({ message: "ID User tidak valid!" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      if (!unit_id) {
        return new Response(
          JSON.stringify({ message: "ID Unit tidak valid!" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      employee = await prisma.employee.findMany({
        where: { userId: user_id, unitId: unit_id },
        include: {
          user: true,
          unit: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
    } else if (unitIdParam) {
      const unit_id = unitIdParam;
      if (!unit_id) {
        return new Response(
          JSON.stringify({ message: "ID Unit tidak valid!" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      employee = await prisma.employee.findMany({
        where: { unitId: unit_id },
        include: {
          user: true,
          unit: true,
        },
        orderBy: {
          updatedAt: "desc",
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
      employee = await prisma.employee.findUnique({
        where: { userId: user_id },
        include: {
          user: true,
          unit: true,
        },
      });
    } else {
      employee = await prisma.employee.findMany({
        include: {
          user: true,
          unit: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
    }

    return new Response(JSON.stringify(employee), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
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

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, unitId, nipp } = body;

    if (!name || !email || !unitId || !nipp) {
      return new Response(JSON.stringify({ message: "Isi semua kolom!" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // cek email unik
    let existing = await prisma.employee.findUnique({ where: { email } });
    if (existing) {
      return new Response(
        JSON.stringify({ message: "Email tersebut sudah dipakai!" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // cek NIPP unik
    existing = await prisma.employee.findUnique({ where: { nipp } });
    if (existing) {
      return new Response(
        JSON.stringify({ message: "NIPP tersebut sudah dipakai!" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // simpan employee
    const employee = await prisma.employee.create({
      data: { name, email, unitId, nipp },
    });

    // link halaman registrasi sistem (langsung ke form signup)
    const registerLink = `${process.env.NEXT_PUBLIC_API_KAI_OFFICE_BASE_URL}/register`;

    // kirim email undangan
    await sendEmail({
      to: email,
      subject: `Undangan Registrasi Sistem - KAI Office`,
      html: `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Undangan Registrasi</title>
      </head>
      <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:40px 0;">
          <tr>
            <td align="center">
              <table cellpadding="0" cellspacing="0" width="600" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background:#004aad;padding:30px;text-align:center;color:#fff;">
                    <h1 style="margin:0;font-size:26px;font-weight:bold;">KAI Office</h1>
                    <p style="margin:8px 0 0;font-size:16px;">Undangan Registrasi Akun</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:40px;">
                    <h2 style="margin:0 0 16px;font-size:22px;color:#333;">Halo ${
                      employee.name
                    }, 👋</h2>
                    <p style="margin:0 0 16px;font-size:15px;color:#555;line-height:1.6;">
                      Anda telah terdaftar sebagai karyawan di <strong>KAI Office</strong>.<br/>
                      Untuk mengakses sistem, silakan daftar akun terlebih dahulu dengan menekan tombol di bawah:
                    </p>

                    <p style="text-align:center;margin:32px 0;">
                      <a href="${registerLink}"
                        style="display:inline-block;padding:12px 28px;background:#004aad;color:#fff;text-decoration:none;font-weight:bold;border-radius:6px;">
                        Daftar Akun Sekarang
                      </a>
                    </p>

                    <p style="font-size:14px;color:#777;line-height:1.6;">
                      Jika tombol tidak berfungsi, salin tautan ini ke browser Anda:
                      <br/>
                      <a href="${registerLink}" style="color:#004aad;word-break:break-all;">${registerLink}</a>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#f8f9fa;padding:20px;text-align:center;font-size:12px;color:#888;">
                    © ${new Date().getFullYear()} KAI Office. Semua hak dilindungi.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `,
    });

    return new Response(
      JSON.stringify({
        message:
          "Data Employee berhasil ditambahkan dan undangan registrasi telah dikirim!",
        employee,
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
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

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, name, email, unitId, nipp } = body;

    console.log(body);

    // Validate required fields
    if (!id || !name || !email || !unitId || !nipp) {
      return new Response(JSON.stringify({ message: "Data tidak valid!" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const existingRecord = await prisma.employee.findUnique({
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

    let existingKodeRecord = await prisma.employee.findUnique({
      where: {
        email,
      },
    });

    if (existingKodeRecord && existingKodeRecord.id !== id) {
      return new Response(
        JSON.stringify({ message: "Email tersebut sudah ada yg pakai!" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    existingKodeRecord = await prisma.employee.findUnique({
      where: {
        nipp,
      },
    });

    if (existingKodeRecord && existingKodeRecord.id !== id) {
      return new Response(
        JSON.stringify({ message: "NIPP tersebut sudah ada yg pakai!" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: { name, email, unitId, nipp },
    });

    const registerLink = `${process.env.NEXT_PUBLIC_API_KAI_OFFICE_BASE_URL}/register`;

    // kirim email undangan
    await sendEmail({
      to: email,
      subject: `Undangan Registrasi Sistem - KAI Office`,
      html: `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Undangan Registrasi</title>
      </head>
      <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:40px 0;">
          <tr>
            <td align="center">
              <table cellpadding="0" cellspacing="0" width="600" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background:#004aad;padding:30px;text-align:center;color:#fff;">
                    <h1 style="margin:0;font-size:26px;font-weight:bold;">KAI Office</h1>
                    <p style="margin:8px 0 0;font-size:16px;">Undangan Registrasi Akun</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:40px;">
                    <h2 style="margin:0 0 16px;font-size:22px;color:#333;">Halo ${
                      employee.name
                    }, 👋</h2>
                    <p style="margin:0 0 16px;font-size:15px;color:#555;line-height:1.6;">
                      Anda telah terdaftar sebagai karyawan di <strong>KAI Office</strong>.<br/>
                      Untuk mengakses sistem, silakan daftar akun terlebih dahulu dengan menekan tombol di bawah:
                    </p>

                    <p style="text-align:center;margin:32px 0;">
                      <a href="${registerLink}"
                        style="display:inline-block;padding:12px 28px;background:#004aad;color:#fff;text-decoration:none;font-weight:bold;border-radius:6px;">
                        Daftar Akun Sekarang
                      </a>
                    </p>

                    <p style="font-size:14px;color:#777;line-height:1.6;">
                      Jika tombol tidak berfungsi, salin tautan ini ke browser Anda:
                      <br/>
                      <a href="${registerLink}" style="color:#004aad;word-break:break-all;">${registerLink}</a>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#f8f9fa;padding:20px;text-align:center;font-size:12px;color:#888;">
                    © ${new Date().getFullYear()} KAI Office. Semua hak dilindungi.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `,
    });

    return new Response(
      JSON.stringify({ message: "Data Employee berhasil diubah!", employee }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
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

    // Ambil record yang mau dihapus
    const existingRecord = await prisma.employee.findUnique({
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

    await prisma.employee.delete({
      where: { id },
    });

    return new Response(
      JSON.stringify({ message: "Data Employee berhasil dihapus!" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
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
