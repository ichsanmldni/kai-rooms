import prisma from "../../../../../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "process";
import { serialize } from "cookie";
import { sendEmail } from "../../../../../lib/sendEmail"; // pastikan path sesuai

const SECRET_KEY = env.JWT_SECRET;
const JWT_EXPIRED = env.JWT_EXPIRED;

function convertTimeToSeconds(timeString) {
  const match = timeString.match(/(\d+)(h|m|s)/);
  if (!match) {
    throw new Error(
      'Invalid time format. Please use a format like "2h", "30m", or "15s".'
    );
  }
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case "h":
      return value * 3600;
    case "m":
      return value * 60;
    case "s":
      return value;
    default:
      throw new Error('Invalid time unit. Use "h", "m", or "s".');
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email && !password) {
      return new Response(JSON.stringify({ message: "Email dan Password wajib diisi!" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    } else if (!email) {
      return new Response(JSON.stringify({ message: "Email wajib diisi!" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    } else if (!password) {
      return new Response(JSON.stringify({ message: "Password wajib diisi!" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return new Response(JSON.stringify({ message: "Tidak ditemukan akun dengan Email tersebut!" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return new Response(JSON.stringify({ message: "Password salah!" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const EXPIRED_TIME = convertTimeToSeconds(JWT_EXPIRED);
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        noTelp: user.noTelp,
        nama: user.name,
        role: user.role,
      },
      SECRET_KEY,
      { expiresIn: EXPIRED_TIME }
    );

    const cookie = serialize("authKAI", token, {
      secure: process.env.NODE_ENV === "production",
      maxAge: parseInt(EXPIRED_TIME.toString()),
      path: "/",
    });

    // Kirim email notifikasi login berhasil
try {
  // Get device and location information
  const deviceInfo = getDeviceInfo(req); 
  const locationInfo = await getLocationInfo(req);
  
  await sendEmail({
    from: `"Admin KAI Rooms" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Login Berhasil - KAI Rooms",
    html: `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Login Berhasil</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          /* Email client compatibility */
          table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
          .email-container { font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
          
          /* Responsive design */
          @media only screen and (max-width: 600px) {
            .mobile-responsive { width: 100% !important; padding: 15px !important; }
            .mobile-text { font-size: 14px !important; }
            .mobile-buttons a { display: block !important; margin: 5px 0 !important; }
          }
        </style>
      </head>
      <body class="email-container" style="margin: 0; padding: 0; background: linear-gradient(135deg, #f0f9ff, #e0f2fe); font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table role="presentation" width="100%" style="border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 20px 0;">
              <!-- Main Container -->
              <table role="presentation" class="mobile-responsive" style="width: 600px; max-width: 600px; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #1e3a8a, #3b82f6, #06b6d4); color: white; padding: 30px 20px; text-align: center; position: relative;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: white;">
                      🚆 KAI Rooms
                    </h1>
                    <p style="margin: 8px 0 0; font-size: 16px; opacity: 0.9; color: white;">Login Berhasil</p>
                  </td>
                </tr>

                <!-- Main Content -->
                <tr>
                  <td style="padding: 30px;">
                    <!-- Greeting -->
                    <div style="margin-bottom: 25px;">
                      <h2 style="color: #1e293b; margin: 0 0 10px; font-size: 22px; font-weight: 600;">Halo, ${user.name}! 👋</h2>
                      <p style="color: #64748b; margin: 0; font-size: 16px; line-height: 1.5;">Kami mendeteksi login baru ke akun KAI Rooms Anda.</p>
                    </div>

                    <!-- Success Badge -->
                    <table role="presentation" style="width: 100%; background: linear-gradient(135deg, #dcfce7, #bbf7d0); border: 1px solid #22c55e; border-radius: 8px; margin-bottom: 25px;">
                      <tr>
                        <td style="padding: 15px; text-align: center;">
                          <div style="color: #15803d; font-weight: bold; font-size: 18px; margin-bottom: 5px;">✅ Login Berhasil</div>
                          <div style="color: #16a34a; font-size: 14px;">Akses ke akun Anda telah dikonfirmasi</div>
                        </td>
                      </tr>
                    </table>

                    <!-- Login Details -->
                    <table role="presentation" style="width: 100%; background: #f8fafc; border-radius: 10px; margin-bottom: 25px; border-left: 4px solid #3b82f6;">
                      <tr>
                        <td style="padding: 20px;">
                          <h3 style="color: #1e293b; margin: 0 0 15px; font-size: 18px; font-weight: 600;">
                            🕐 Detail Login
                          </h3>
                          
                          <!-- Date & Time -->
                          <table role="presentation" style="width: 100%; margin-bottom: 12px; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                            <tr>
                              <td style="width: 40px; vertical-align: top;">
                                <div style="background: #dbeafe; color: #1d4ed8; padding: 6px; border-radius: 6px; font-size: 14px; text-align: center; width: 24px;">📅</div>
                              </td>
                              <td style="vertical-align: top; padding-left: 10px;">
                                <div style="font-weight: bold; color: #1e293b; font-size: 14px;">Waktu Login</div>
                                <div style="color: #64748b; font-size: 13px;">${new Date().toLocaleString("id-ID", { 
                                  timeZone: "Asia/Jakarta",
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  timeZoneName: 'short'
                                })}</div>
                              </td>
                            </tr>
                          </table>

                          <!-- Email -->
                          <table role="presentation" style="width: 100%; margin-bottom: 12px; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                            <tr>
                              <td style="width: 40px; vertical-align: top;">
                                <div style="background: #fef3c7; color: #d97706; padding: 6px; border-radius: 6px; font-size: 14px; text-align: center; width: 24px;">📧</div>
                              </td>
                              <td style="vertical-align: top; padding-left: 10px;">
                                <div style="font-weight: bold; color: #1e293b; font-size: 14px;">Email</div>
                                <div style="color: #64748b; font-size: 13px; word-break: break-all;">${email}</div>
                              </td>
                            </tr>
                          </table>

                          <!-- Device -->
                          <table role="presentation" style="width: 100%; margin-bottom: 12px; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                            <tr>
                              <td style="width: 40px; vertical-align: top;">
                                <div style="background: #e0e7ff; color: #6366f1; padding: 6px; border-radius: 6px; font-size: 14px; text-align: center; width: 24px;">📱</div>
                              </td>
                              <td style="vertical-align: top; padding-left: 10px;">
                                <div style="font-weight: bold; color: #1e293b; font-size: 14px;">Perangkat</div>
                                <div style="color: #64748b; font-size: 13px;">${deviceInfo.browser} di ${deviceInfo.os}</div>
                                <div style="color: #64748b; font-size: 12px; opacity: 0.8;">${deviceInfo.device}</div>
                              </td>
                            </tr>
                          </table>

                          <!-- Location -->
                          <table role="presentation" style="width: 100%; padding: 8px 0;">
                            <tr>
                              <td style="width: 40px; vertical-align: top;">
                                <div style="background: #dcfce7; color: #16a34a; padding: 6px; border-radius: 6px; font-size: 14px; text-align: center; width: 24px;">📍</div>
                              </td>
                              <td style="vertical-align: top; padding-left: 10px;">
                                <div style="font-weight: bold; color: #1e293b; font-size: 14px;">Lokasi</div>
                                <div style="color: #64748b; font-size: 13px;">${locationInfo.city}, ${locationInfo.region}</div>
                                <div style="color: #64748b; font-size: 12px; opacity: 0.8;">IP: ${locationInfo.ip}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Security Notice -->
                    <table role="presentation" style="width: 100%; background: linear-gradient(135deg, #fef7cd, #fde68a); border: 1px solid #f59e0b; border-radius: 8px; margin-bottom: 25px;">
                      <tr>
                        <td style="padding: 15px;">
                          <table role="presentation" style="width: 100%;">
                            <tr>
                              <td style="width: 30px; vertical-align: top;">
                                <div style="color: #d97706; font-size: 16px;">⚠️</div>
                              </td>
                              <td style="vertical-align: top; padding-left: 10px;">
                                <div style="color: #92400e; font-weight: bold; margin-bottom: 5px;">Keamanan Akun</div>
                                <div style="color: #a16207; font-size: 14px; line-height: 1.4;">
                                  Jika ini bukan aktivitas Anda, segera hubungi admin atau ganti password untuk mengamankan akun.
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Action Buttons -->
                    <table role="presentation" style="width: 100%; margin-bottom: 20px;">
                      <tr>
                        <td align="center" class="mobile-buttons">
                          <a href="http://localhost:3000" 
                             style="display: inline-block; background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-right: 10px; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);">
                            Masuk ke KAI Rooms
                          </a>
                          <a href="mailto:support@kai.id" 
                             style="display: inline-block; background: #f1f5f9; color: #475569; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-left: 10px; border: 1px solid #e2e8f0;">
                            📞 Hubungi Support
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Tips -->
                    <table role="presentation" style="width: 100%; background: #f0f9ff; border-radius: 8px; border-left: 4px solid #0ea5e9;">
                      <tr>
                        <td style="padding: 15px;">
                          <div style="color: #0c4a6e; font-weight: bold; margin-bottom: 10px;">
                            💡 Tips Keamanan
                          </div>
                          <div style="color: #075985; font-size: 14px; line-height: 1.6;">
                            • Jangan bagikan informasi login Anda<br>
                            • Gunakan password yang kuat dan unik<br>
                            • Logout setelah selesai menggunakan<br>
                            • Periksa aktivitas login secara berkala
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background: linear-gradient(135deg, #f8fafc, #f1f5f9); padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <div style="color: #64748b; font-size: 14px; margin-bottom: 10px;">
                      Terima kasih telah mempercayai layanan KAI Rooms
                    </div>
                    <div style="color: #94a3b8; font-size: 12px; line-height: 1.4; margin-bottom: 15px;">
                      © ${new Date().getFullYear()} PT Kereta Api Indonesia (Persero)<br>
                      Email ini dikirim secara otomatis, mohon tidak membalas email ini.
                    </div>
                    <div>
                      <a href="#" style="color: #64748b; text-decoration: none; font-size: 12px; margin: 0 10px;">Privacy Policy</a>
                      <span style="color: #cbd5e1;">|</span>
                      <a href="#" style="color: #64748b; text-decoration: none; font-size: 12px; margin: 0 10px;">Terms of Service</a>
                      <span style="color: #cbd5e1;">|</span>
                      <a href="#" style="color: #64748b; text-decoration: none; font-size: 12px; margin: 0 10px;">Help Center</a>
                    </div>
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

  console.log("Login notification email sent successfully");
} catch (error) {
  console.error("Failed to send login notification email:", error);
}

// Helper functions untuk device dan location info
function getDeviceInfo(req) {
  const userAgent = req.headers['user-agent'] || '';
  
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';
  let device = 'Desktop Computer';

  // Browser detection
  if (userAgent.includes('Edg')) browser = 'Microsoft Edge';
  else if (userAgent.includes('Chrome')) browser = 'Google Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Mozilla Firefox';
  else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
  else if (userAgent.includes('Opera')) browser = 'Opera';

  // OS detection
  if (userAgent.includes('Windows NT')) os = 'Windows';
  else if (userAgent.includes('Mac OS X')) os = 'macOS';
  else if (userAgent.includes('Linux') && !userAgent.includes('Android')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iPhone OS') || userAgent.includes('iPad')) os = 'iOS';

  // Device detection
  if (userAgent.includes('Mobile') && !userAgent.includes('iPad')) device = 'Mobile Device';
  else if (userAgent.includes('iPad') || userAgent.includes('Tablet')) device = 'Tablet';
  else device = 'Desktop Computer';

  return { browser, os, device };
}

async function getLocationInfo(req) {
  try {
    // Get real IP address (considering proxies)
    const ip = req.headers['x-forwarded-for'] || 
               req.headers['x-real-ip'] || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress ||
               (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
               '127.0.0.1';
    
    const realIp = ip.split(',')[0].trim();
    
    // Skip localhost/private IPs
    if (realIp === '127.0.0.1' || realIp === '::1' || realIp.startsWith('192.168.') || realIp.startsWith('10.')) {
      return {
        ip: 'Local Network',
        city: 'Local',
        region: 'Local Network',
        country: 'Indonesia'
      };
    }

    // Use free IP geolocation service
    const response = await fetch(`http://ip-api.com/json/${realIp}?fields=country,regionName,city,status`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return {
        ip: realIp,
        city: data.city || 'Unknown City',
        region: data.regionName || 'Unknown Region',
        country: data.country || 'Unknown Country'
      };
    } else {
      throw new Error('Geolocation failed');
    }
  } catch (error) {
    console.error('Error getting location info:', error);
    return {
      ip: 'Unknown',
      city: 'Unknown City',
      region: 'Unknown Region', 
      country: 'Indonesia'
    };
  }
}

    return new Response(JSON.stringify({ message: "Login berhasil!", token }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": cookie,
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Terjadi Kesalahan!",
        error: error instanceof Error ? error.message : "Terjadi Kesalahan",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
