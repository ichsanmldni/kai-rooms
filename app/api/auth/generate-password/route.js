import bcrypt from "bcrypt";

export async function POST(req) {
  try {
    const body = await req.json();

    const { password } = body;

    const hashedPassword = await bcrypt.hash(password, 10);

    return new Response(JSON.stringify(hashedPassword), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Something went wrong",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
