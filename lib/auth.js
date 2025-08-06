import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET;

export function getUserFromCookie() {
  const cookieStore = cookies();
  const token = cookieStore.get("authKAI")?.value;

  if (!token) return null;

  try {
    const user = jwt.verify(token, SECRET_KEY);
    return user;
  } catch (err) {
    return null;
  }
}
