import { builder } from "~/graphql/builder";

//get each level score
builder.queryField("getLevelXp", (t) =>
  t.prismaField({
    type: "Level",
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
      const data = await ctx.prisma.level.findUniqueOrThrow({
        where: {
          id: Number(args.levelId),
        },
        ...query,
      });
      return data;
    },
  }),
);
