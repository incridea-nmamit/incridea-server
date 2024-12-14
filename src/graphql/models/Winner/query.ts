import { builder } from "~/graphql/builder";

builder.queryField("winnersByEvent", (t) =>
  t.prismaField({
    type: ["Winners"],
    errors: {
      types: [Error],
    },
    args: {
      eventId: t.arg.id({ required: true }),
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) throw new Error("Not Authenticated");
      if (!["JUDGE", "JURY"].includes(user.role))
        throw new Error("You are not authorized");
      return ctx.prisma.winners.findMany({
        where: {
          eventId: Number(args.eventId),
        },
        ...query,
      });
    },
  }),
);

builder.queryField("allWinners", (t) =>
  t.prismaField({
    type: ["Winners"],
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) throw new Error("Not Authenticated");
      if (!["JUDGE", "JURY"].includes(user.role))
        throw new Error("You are not authorized");
      return ctx.prisma.winners.findMany({
        ...query,
      });
    },
  }),
);
