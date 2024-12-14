import { DayType } from "@prisma/client";

import { builder } from "~/graphql/builder";

builder.queryField("getCards", (t) =>
  t.prismaField({
    type: ["Card"],
    args: {
      day: t.arg({ type: DayType, required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) throw new Error("Not authenticated");
      return ctx.prisma.card.findMany({
        where: {
          day: args.day,
        },
      });
    },
  }),
);
