import { WinnerType } from "@prisma/client";

import { builder } from "~/graphql/builder";

builder.mutationField("createWinner", (t) =>
  t.prismaField({
    type: "Winners",
    args: {
      teamId: t.arg({ type: "ID", required: true }),
      eventId: t.arg({ type: "ID", required: true }),
      type: t.arg({ type: WinnerType, required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }
      if (user.role !== "JUDGE") {
        throw new Error("Not authorized");
      }
      const event = await ctx.prisma.event.findFirst({
        where: {
          id: Number(args.eventId),
          Rounds: {
            some: {
              Judges: {
                some: {
                  userId: user.id,
                },
              },
            },
          },
        },
        select: {
          category: true,
          Rounds: {
            select: {
              completed: true,
              roundNo: true,
              Judges: true,
            },
          },
        },
      });
      if (!event) {
        throw new Error("Not authorized");
      }

      const total_rounds = event.Rounds.length;
      if (event.Rounds[total_rounds - 1]!.completed) {
        throw new Error("Cant Change Round Completed");
      }
      // check if he is the judge of last round
      if (
        !event.Rounds[total_rounds - 1]!.Judges.some(
          (judge) => judge.userId === user.id,
        )
      ) {
        throw new Error("Not authorized");
      }
      const team = await ctx.prisma.team.findUnique({
        where: {
          id: Number(args.teamId),
        },
        include: {
          TeamMembers: true,
        },
      });

      if (!team) {
        throw new Error("Team not found");
      }
      if (team.eventId !== Number(args.eventId)) {
        throw new Error("Team not found");
      }
      if (team.roundNo !== total_rounds) {
        throw new Error("Team not promoted to last round");
      }

      const winner = await ctx.prisma.winners.findFirst({
        where: {
          type: args.type as WinnerType,
          eventId: Number(args.eventId),
          teamId: Number(args.teamId),
        },
      });
      if (winner) {
        throw new Error("Winner already exists");
      }
      const data = await ctx.prisma.winners.create({
        data: {
          teamId: Number(args.teamId),
          eventId: Number(args.eventId),
          type: args.type,
        },
        ...query,
      });
      //check if winner level exists
      const levelExists = await ctx.prisma.level.findFirst({
        where: {
          winnerId: data.id,
        },
      });
      //get full team userId
      const teamMembers = team.TeamMembers.map((member) => member.userId);
      if (levelExists) {
        //check if team members are already given xp points
        const xp = await ctx.prisma.xP.findMany({
          where: {
            userId: {
              in: teamMembers,
            },
            levelId: levelExists.id,
          },
        });
        if (xp.length == 0) {
          //give xp points to all team members
          await ctx.prisma.xP.createMany({
            data: teamMembers.map((userId) => ({
              userId,
              levelId: levelExists.id,
            })),
          });
        }
      } else {
        // give xp points for winning
        let point =
          args.type === "WINNER" ? 100 : args.type === "RUNNER_UP" ? 75 : 50;
        if (event.category === "CORE") {
          point =
            args.type === "WINNER" ? 150 : args.type === "RUNNER_UP" ? 100 : 75;
        }
        const level = await ctx.prisma.level.create({
          data: {
            point: point,
            winnerId: data.id,
          },
        });
        //give xp points to all team members
        await ctx.prisma.xP.createMany({
          data: teamMembers.map((userId) => ({
            userId,
            levelId: level.id,
          })),
        });
      }
      return data;
    },
  }),
);

// delete winner
builder.mutationField("deleteWinner", (t) =>
  t.prismaField({
    type: "Winners",
    args: {
      id: t.arg({ type: "ID", required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }
      if (user.role !== "JUDGE") {
        throw new Error("Not authorized");
      }
      const winner = await ctx.prisma.winners.findUnique({
        where: {
          id: Number(args.id),
        },
        include: {
          Team: {
            select: {
              TeamMembers: {
                select: {
                  userId: true,
                },
              },
            },
          },
        },
      });
      if (!winner) {
        throw new Error("Winner not found");
      }
      const event = await ctx.prisma.event.findFirst({
        where: {
          id: winner.eventId,
          Rounds: {
            some: {
              Judges: {
                some: {
                  userId: user.id,
                },
              },
            },
          },
        },
        select: {
          Rounds: {
            select: {
              Judges: true,
              completed: true,
            },
          },
        },
      });
      if (!event) {
        throw new Error("Not authorized");
      }
      const total_rounds = event.Rounds.length;
      if (event.Rounds[total_rounds - 1]!.completed) {
        throw new Error("Cant Change Round Completed");
      }
      if (
        !event.Rounds[total_rounds - 1]!.Judges.some(
          (judge) => judge.userId === user.id,
        )
      ) {
        throw new Error("Not authorized");
      }
      //delete winner xp points
      const level = await ctx.prisma.level.findFirst({
        where: {
          winnerId: Number(args.id),
        },
      });
      //get all team members id
      const teamMembers = winner.Team.TeamMembers.map(
        (member) => member.userId,
      );
      if (level) {
        await ctx.prisma.xP.deleteMany({
          where: {
            userId: {
              in: teamMembers,
            },
            levelId: level.id,
          },
        });
        await ctx.prisma.level.delete({
          where: {
            id: level.id,
          },
        });
      }
      const data = await ctx.prisma.winners.delete({
        where: {
          id: Number(args.id),
        },
        ...query,
      });
      return data;
    },
  }),
);
