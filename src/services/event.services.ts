import { type EventCategory } from "@prisma/client";

import { prisma } from "~/utils/db";

export async function canRegister(
  userId: number,
  type: string,
  eventCategory: EventCategory,
) {
  if (eventCategory !== "CORE") return false;

  const registeredEvents = await prisma.event.findMany({
    where: {
      AND: [
        {
          Teams: {
            some: {
              TeamMembers: {
                some: {
                  userId,
                },
              },
            },
          },
        },
        {
          category: "CORE",
        },
      ],
    },
  });

  if (registeredEvents.length > 0 && type == "OTHER") return false;

  return true;
}
