const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const units = [
  "Sistem Informasi",
  "Jalan Rel dan Jembatan",
  "Unit SDM",
  "Keuangan",
  "Hukum",
  "Listrik Aliran Atas",
  "Sarana",
  "Sintelis",
  "KNA",
  "Humas",
  "Angkutan Penumpang",
  "Bangunan",
  "Pengamanan",
  "Kesehatan",
  "Fasilitas Penumpang",
  "Penjagaan Aset",
  "PBJ",
];

const rooms = [
  "Batavia",
  "Sunda Kelapa",
  "Nusantara",
  "Sriwijaya",
  "Gajah Mada",
  "Borneo",
];

const firstNames = [
  "Rizky",
  "Dewi",
  "Andi",
  "Putri",
  "Agus",
  "Sari",
  "Budi",
  "Fitri",
  "Hendra",
  "Ayu",
  "Tono",
  "Rina",
  "Dian",
  "Dedi",
  "Nina",
  "Arif",
  "Yuni",
];

const lastNames = [
  "Saputra",
  "Susanti",
  "Wijaya",
  "Setiawan",
  "Siregar",
  "Putra",
  "Santoso",
  "Maulana",
  "Rahmawati",
  "Syahputra",
  "Kurniawan",
];

const sampleMeetingTitles = [
  "Rapat Koordinasi Bulanan",
  "Evaluasi Proyek A",
  "Perencanaan Anggaran Q4",
  "Sosialisasi Prosedur Baru",
  "Daily Standup Team",
  "Presentasi Klien",
  "Review Kinerja Triwulan",
];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateFullName() {
  return `${getRandom(firstNames)} ${getRandom(lastNames)}`;
}

function generateEmail(name, unit) {
  return `${name.toLowerCase().replace(/\s/g, "")}.${unit
    .toLowerCase()
    .replace(/\s/g, "")}@example.com`;
}

async function main() {
  console.log("🌱 Mulai seeding unit, pegawai, dan ruang...");

  // Seed Rooms
  for (const roomName of rooms) {
    await prisma.room.upsert({
      where: { name: roomName },
      update: {},
      create: {
        name: roomName,
        location: `Lantai ${Math.floor(Math.random() * 5) + 1}`,
        capacity: Math.floor(Math.random() * 10) + 4,
        isAvailable: true,
        autoCancel: false,
        cancelDeadline: 15,
      },
    });
  }

  // Seed Units dan Pegawai
  const unitMap = {};
  for (const unitName of units) {
    const unit = await prisma.unit.upsert({
      where: { name: unitName },
      update: {},
      create: {
        name: unitName,
      },
    });
    unitMap[unitName] = unit;

    for (let i = 1; i <= 5; i++) {
      const fullName = generateFullName();
      const email = generateEmail(fullName, unitName);

      const setting = await prisma.setting.create({ data: {} });

      const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          name: fullName,
          email,
          password: "12345678",
          noTelp: `08${Math.floor(1000000000 + Math.random() * 900000000)}`,
          settingId: setting.id,
          role: "USER",
        },
      });

      await prisma.employee.upsert({
        where: { email },
        update: {},
        create: {
          name: user.name,
          email: user.email,
          userId: user.id,
          unitId: unit.id,
        },
      });
    }
  }

  console.log("📅 Seeding meeting mingguan...");

  const allRooms = await prisma.room.findMany();
  const allUsers = await prisma.user.findMany({ where: { role: "USER" } });
  const allEmployees = await prisma.employee.findMany();
  const allUnits = Object.values(unitMap);

  const today = new Date();
  today.setHours(9, 0, 0, 0);

  const usedCreatedByIds = new Set();

  for (let dayOffset = -2; dayOffset <= 4; dayOffset++) {
    const baseDate = new Date(today);
    baseDate.setDate(today.getDate() + dayOffset);

    for (let i = 0; i < 3; i++) {
      const start = new Date(baseDate);
      start.setHours(9 + i * 2);

      const end = new Date(start);
      end.setHours(start.getHours() + 1);

      // Cari user yang belum pernah dipakai sebagai createdById
      const availableCreators = allUsers.filter(
        (u) => !usedCreatedByIds.has(u.id)
      );
      if (availableCreators.length === 0) break; // tidak ada lagi user yang tersedia

      const createdBy = getRandom(availableCreators);
      usedCreatedByIds.add(createdBy.id);

      const randomRoom = getRandom(allRooms);
      const organizerUnit = getRandom(allUnits);
      const meetingTitle = getRandom(sampleMeetingTitles);

      const meeting = await prisma.meeting.create({
        data: {
          title: meetingTitle,
          description: `Agenda: ${meetingTitle}, diselenggarakan oleh ${organizerUnit.name}.`,
          startTime: start,
          endTime: end,
          roomId: randomRoom.id,
          createdById: createdBy.id,
          organizerUnitId: organizerUnit.id,
        },
      });

      const shuffledEmployees = allEmployees.sort(() => 0.5 - Math.random());
      const selectedEmployees = shuffledEmployees.slice(
        0,
        Math.floor(Math.random() * 5) + 1
      );

      for (const emp of selectedEmployees) {
        await prisma.meetingAttendee.create({
          data: {
            meetingId: meeting.id,
            employeeId: emp.id,
          },
        });
      }

      const userAttendees = allUsers
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 4) + 1);

      await prisma.meeting.update({
        where: { id: meeting.id },
        data: {
          attendees: {
            connect: userAttendees.map((u) => ({ id: u.id })),
          },
          participants: {
            connect: selectedEmployees.map((e) => ({ id: e.id })),
          },
        },
      });
    }
  }

  console.log("🔔 Menambahkan notifikasi untuk user tertentu...");

  const targetUserId = "f127fd5c-a1f9-4fbb-b333-d449aaddd929";

  const notificationMessages = [
    {
      title: "Rapat Koordinasi Mingguan",
      message:
        "Anda dijadwalkan menghadiri rapat koordinasi pada hari Jumat pukul 10.00 WIB.",
    },
    {
      title: "Perubahan Jadwal Meeting",
      message: "Meeting dengan tim Humas diundur menjadi pukul 14.00 WIB.",
    },
    {
      title: "Undangan Rapat Proyek A",
      message:
        "Silakan periksa undangan rapat untuk evaluasi proyek A di dashboard Anda.",
    },
  ];

  for (const notif of notificationMessages) {
    await prisma.notification.create({
      data: {
        userId: targetUserId,
        title: notif.title,
        message: notif.message,
        isRead: false,
      },
    });
  }

  // Upsert khusus untuk employee Ichsan Maldini Hamid
  const ichsanSetting = await prisma.setting.upsert({
    where: { id: "f127fd5c-a1f9-4fbb-b333-d449aaddd929" }, // optional if you store by ID
    update: {},
    create: {},
  });

  const ichsanUser = await prisma.user.upsert({
    where: { email: "ichsan225@gmail.com" },
    update: {
      name: "Ichsan Maldini Hamid",
      noTelp: "085810676264",
      role: "USER",
      settingId: ichsanSetting.id,
    },
    create: {
      id: "f127fd5c-a1f9-4fbb-b333-d449aaddd929",
      email: "ichsan225@gmail.com",
      name: "Ichsan Maldini Hamid",
      password: "$2b$10$6zqmqJLeLW3Bfj6XcALz2eibQNDcGxffO3BwcUV2y/CUS3LVH9fo2", // already hashed
      noTelp: "085810676264",
      role: "USER",
      settingId: ichsanSetting.id,
    },
  });

  const defaultUnit = await prisma.unit.upsert({
    where: { name: "Sistem Informasi" },
    update: {},
    create: { name: "Sistem Informasi" },
  });

  await prisma.employee.upsert({
    where: { email: "ichsan225@gmail.com" },
    update: {
      name: "Ichsan Maldini Hamid",
      userId: ichsanUser.id,
      unitId: defaultUnit.id,
    },
    create: {
      name: "Ichsan Maldini Hamid",
      email: "ichsan225@gmail.com",
      userId: ichsanUser.id,
      unitId: defaultUnit.id,
    },
  });

  console.log("📩 Notifikasi berhasil ditambahkan.");

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
