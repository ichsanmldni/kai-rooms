import prisma from "../../../../../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "process";
import { serialize } from "cookie";

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
      return new Response(
        JSON.stringify({ message: "Email dan Password wajib diisi!" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else if (!email) {
      return new Response(JSON.stringify({ message: "Email wajib diisi!" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    } else if (!password) {
      return new Response(
        JSON.stringify({ message: "Password wajib diisi!" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return new Response(
        JSON.stringify({
          message: "Tidak ditemukan akun dengan Email tersebut!",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return new Response(JSON.stringify({ message: "Password salah!" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const EXPIRED_TIME = convertTimeToSeconds(JWT_EXPIRED);

    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: "ADMIN",
      },
      SECRET_KEY,
      { expiresIn: EXPIRED_TIME }
    );

    const cookie = serialize("authKAI", token, {
      secure: process.env.NODE_ENV === "production",
      maxAge: parseInt(EXPIRED_TIME.toString()),
      path: "/",
    });

    return new Response(
      JSON.stringify({
        message: "Login berhasil!",
        token,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": cookie,
        },
      }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({
        message: "Terjadi Kesalahan!",
        error: error instanceof Error ? error.message : "Terjadi Kesalahan ",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
