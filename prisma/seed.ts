import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const main = async () => {
  await db.emailMonitor.create({
    data: {},
  });

  const college = await db.college.create({
    data: {
      name: "NMAM Institute of Technology",
      type: "ENGINEERING",
    },
  });

  const user = await db.user.create({
    data: {
      email: "test@incridea.in",
      name: "Test",
      password: await bcrypt.hash("asdfghjkl;'", 12),
      isVerified: true,
      role: "ADMIN",
      College: {
        connect: {
          id: college.id,
        },
      },
    },
  });

  const branch = await db.branch.create({
    data: {
      name: "CSE",
      details: "Computer Science and Engineering",
    },
  });

  await db.branchRep.create({
    data: {
      Branch: {
        connect: {
          id: branch.id,
        },
      },
      User: {
        connect: {
          id: user.id,
        },
      },
    },
  });

  const event = await db.event.create({
    data: {
      name: "Test Event",
      category: "CORE",
      // NOTE: RTE will parse description, which might lead to client build fails, hence this example RTE data is used in seed
      description: JSON.stringify({
        blocks: [
          {
            key: "de7u0",
            text: "This is the description for this test event",
            type: "unstyled",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
          },
        ],
        entityMap: {},
      }),
      fees: 100,
      maxTeams: 10,
      minTeamSize: 2,
      maxTeamSize: 3,
      eventType: "INDIVIDUAL_MULTIPLE_ENTRY",
      image: "",
      published: true,
      venue: "Sadananda",
      Rounds: {
        create: {
          roundNo: 1,
        },
      },
      Branch: {
        connect: {
          id: branch.id,
        },
      },
    },
  });

  await db.organizer.create({
    data: {
      Event: {
        connect: {
          id: event.id,
        },
      },
      User: {
        connect: {
          id: user.id,
        },
      },
    },
  });

  const teamMembers = [
    await db.user.create({
      data: {
        email: "user1@incridea.in",
        name: "User 1",
        password: await bcrypt.hash("asdfghjkl;'", 12),
        isVerified: true,
        role: "PARTICIPANT",
        collegeId: college.id,
      },
    }),
    await db.user.create({
      data: {
        email: "user2@incridea.in",
        name: "User 2",
        password: await bcrypt.hash("asdfghjkl;'", 12),
        isVerified: true,
        role: "PARTICIPANT",
        collegeId: college.id,
      },
    }),
  ] as const;

  await db.team.create({
    data: {
      name: "Test team",
      attended: false,
      confirmed: true,
      EventPaymentOrder: {
        create: {
          orderId: "",
          amount: 100,
          status: "SUCCESS",
          paymentData: { name: "Razorpay" },
        },
      },
      Event: {
        connect: {
          id: event.id,
        },
      },
      leaderId: teamMembers[0].id,
      TeamMembers: {
        createMany: {
          data: Array.from(teamMembers, (member) => ({
            userId: member.id,
          })),
        },
      },
    },
  });
};

main().catch(console.log);
