import { builder } from "~/graphql/builder";

builder.queryField("roundByJudge", (t) =>
  t.prismaField({
    type: "Round",
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
      return await ctx.prisma.round.findFirstOrThrow({
        where: {
          Judges: {
            some: {
              userId: user.id,
            },
          },
        },
        ...query,
      });
    },
  }),
);
