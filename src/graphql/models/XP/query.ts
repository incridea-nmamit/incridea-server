import { builder } from "~/graphql/builder";

//get all user xp points
builder.queryField("getUserXp", (t) =>
  t.prismaField({
    type: ["XP"],
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }
      const data = await ctx.prisma.xP.findMany({
        where: {
          userId: Number(user.id),
        },
        include: {
          Level: true,
        },
        ...query,
      });
      return data;
    },
  }),
);

//get user score based on level
builder.queryField("getUserLevelScore", (t) =>
  t.prismaField({
    type: "XP",
    args: {
      levelId: t.arg({ type: "ID", required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }
      const data = await ctx.prisma.xP.findUniqueOrThrow({
        where: {
          userId_levelId: {
            userId: Number(user.id),
            levelId: Number(args.levelId),
          },
        },
        include: {
          Level: true,
        },
        ...query,
      });
      return data;
    },
  }),
);

//get all users xp for leaderboard
builder.queryField("getXpLeaderboard", (t) =>
  t.prismaField({
    type: ["XP"],
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const leaderboard = await ctx.prisma.xP.findMany({
        include: {
          User: true,
          Level: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });
      return leaderboard;
    },
  }),
);
