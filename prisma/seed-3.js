const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🆔 Sinkronisasi NIPP dari Employee ke User...");

  // Ambil semua employee yang punya userId & sudah ada nipp
  const employees = await prisma.employee.findMany({
    where: { nipp: { not: null }, userId: { not: null } },
    select: { nipp: true, userId: true },
  });

  const updates = employees.map((emp) =>
    prisma.user.update({
      where: { id: emp.userId },
      data: { nipp: emp.nipp },
    })
  );

  await prisma.$transaction(updates);

  console.log(
    `✅ Berhasil update ${employees.length} user.nipp dari employee.nipp`
  );
}

main()
  .catch((e) => {
    console.error("❌ Error saat update:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
