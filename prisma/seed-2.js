const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🆔 Update employee NIPP...");

  const employees = await prisma.employee.findMany({
    where: { nipp: null },
    orderBy: { createdAt: "asc" }, // opsional kalau ada createdAt
  });

  let counter = 10001;
  for (const emp of employees) {
    await prisma.employee.update({
      where: { id: emp.id },
      data: {
        nipp: `${counter}`, // angka doang
      },
    });
    counter++;
  }

  console.log(
    "✅ NIPP dummy numeric berhasil ditambahkan untuk semua employee."
  );

  console.log("✅ Seeding selesai.");
}

main()
  .catch((e) => {
    console.error("❌ Error saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
