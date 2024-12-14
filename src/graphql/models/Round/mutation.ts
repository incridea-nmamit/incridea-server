import { builder } from "~/graphql/builder";

builder.mutationField("createRound", (t) =>
  t.prismaField({
    type: "Round",
    args: {
      eventId: t.arg.id({ required: true }),
      date: t.arg({ type: "DateTime", required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }
      if (user.role !== "ORGANIZER") {
        throw new Error("Not authorized");
      }
      const event = await ctx.prisma.event.findUnique({
        where: {
          id: Number(args.eventId),
        },
        include: {
          Organizers: true,
          Rounds: true,
        },
      });
      if (!event) {
        throw new Error("Event not found");
      }
      if (!event.Organizers.find((o) => o.userId === user.id)) {
        throw new Error("Not authorized");
      }
      const roundNumber = event.Rounds.length + 1;
      return ctx.prisma.round.create({
        data: {
          roundNo: roundNumber,
          date: new Date(args.date),
          Event: {
            connect: {
              id: Number(args.eventId),
            },
          },
        },
      });
    },
  }),
);

builder.mutationField("deleteRound", (t) =>
  t.prismaField({
    type: "Round",
    args: {
      eventId: t.arg.id({ required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }
      if (user.role !== "ORGANIZER") {
        throw new Error("Not authorized");
      }
      const lastRound = await ctx.prisma.round.findFirst({
        where: {
          eventId: Number(args.eventId),
        },
        orderBy: {
          roundNo: "desc",
        },
      });
      if (!lastRound) {
        throw new Error("No rounds found");
      }
      const round = await ctx.prisma.round.findUnique({
        where: {
          eventId_roundNo: {
            eventId: Number(args.eventId),
            roundNo: lastRound.roundNo,
          },
        },
        include: {
          Event: {
            include: {
              Organizers: true,
            },
          },
        },
      });
      if (!round) {
        throw new Error("Round not found");
      }
      if (!round.Event.Organizers.find((o) => o.userId === user.id)) {
        throw new Error("Not authorized");
      }
      return ctx.prisma.round.delete({
        where: {
          eventId_roundNo: {
            eventId: Number(args.eventId),
            roundNo: lastRound.roundNo,
          },
        },
      });
    },
  }),
);

// judge mark round as completed
builder.mutationField("completeRound", (t) =>
  t.prismaField({
    type: "Round",
    args: {
      eventId: t.arg.id({ required: true }),
      roundNo: t.arg({ type: "Int", required: true }),
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
      const round = await ctx.prisma.round.findUnique({
        where: {
          eventId_roundNo: {
            eventId: Number(args.eventId),
            roundNo: args.roundNo,
          },
        },
        include: {
          Judges: true,
        },
      });
      if (!round) {
        throw new Error("Round not found");
      }
      const judge = round.Judges.find((j) => j.userId === user.id);
      if (!judge) {
        throw new Error("Not authorized");
      }
      const data = await ctx.prisma.round.update({
        where: {
          eventId_roundNo: {
            eventId: Number(args.eventId),
            roundNo: args.roundNo,
          },
        },
        data: {
          completed: true,
        },
      });
      await ctx.pubsub.publish(
        `STATUS_UPDATE/${args.eventId}-${args.roundNo}`,
        {
          eventId: args.eventId,
          roundNo: args.roundNo,
        },
      );
      return data;
    },
  }),
);

builder.mutationField("changeSelectStatus", (t) =>
  t.prismaField({
    type: "Round",
    errors: {
      types: [Error],
    },
    args: {
      eventId: t.arg.id({ required: true }),
      roundNo: t.arg({ type: "Int", required: true }),
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not Authenticated");
      }
      if (user.role != "JUDGE") {
        throw new Error("Not Authorized");
      }

      const isJudge = await ctx.prisma.judge.findUnique({
        where: {
          userId_eventId_roundNo: {
            userId: user.id,
            eventId: Number(args.eventId),
            roundNo: args.roundNo,
          },
        },
      });
      if (!isJudge) {
        throw new Error("Not Authorized");
      }
      const round = await ctx.prisma.round.findUnique({
        where: {
          eventId_roundNo: {
            eventId: Number(args.eventId),
            roundNo: args.roundNo,
          },
        },
      });
      if (!round) {
        throw new Error("Round not found");
      }
      const data = await ctx.prisma.round.update({
        where: {
          eventId_roundNo: {
            eventId: Number(args.eventId),
            roundNo: args.roundNo,
          },
        },
        data: {
          selectStatus: !round.selectStatus,
        },
      });
      if (!data) throw new Error("No ROund FOund");
      await ctx.pubsub.publish(
        `STATUS_UPDATE/${args.eventId}-${args.roundNo}`,
        {
          eventId: args.eventId,
          roundNo: args.roundNo,
        },
      );
      return data;
    },
  }),
);
