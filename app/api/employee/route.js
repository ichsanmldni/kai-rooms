import prisma from "../../../lib/prisma";

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
