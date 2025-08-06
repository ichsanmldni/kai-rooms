import prisma from "../../../../lib/prisma";
import { createNotification } from "../../../../api-client/notification"; // Pastikan path-nya benar

export async function GET() {
  const now = new Date();
  const in15Minutes = new Date(now.getTime() + 15 * 60 * 1000);

  const meetings = await prisma.meeting.findMany({
    where: {
      startTime: {
        gte: now,
        lte: in15Minutes,
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
    },
  });

  for (const meeting of meetings) {
    for (const attendee of meeting.meetingAttendees) {
      const user = attendee.employee.user;

      if (user && user.settings?.meetingReminder) {
        await createNotification({
          userId: user.id,
          title: "Meeting akan dimulai",
          message: `Meeting "${meeting.title}" akan dimulai dalam 15 menit.`,
        });
      }
    }
  }

  return new Response(JSON.stringify({ success: true }));
}
