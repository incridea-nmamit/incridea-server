import { DayType } from "@prisma/client";

import { builder } from "~/graphql/builder";
import { checkIfPublicityMember } from "~/graphql/models/UserInHotel/utils";

builder.queryField("getAllSubmissions", (t) =>
  t.prismaField({
    type: ["Submission"],
    args: {
      day: t.arg({ type: DayType, required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) throw new Error("Not authenticated");
      if (!checkIfPublicityMember(user.id)) throw new Error("Not authorized");
      return ctx.prisma.submission.findMany({
        where: {
          Card: {
            day: args.day,
          },
        },
      });
    },
  }),
);

builder.queryField("submissionsByUser", (t) =>
  t.prismaField({
    type: ["Submission"],
    args: {
      day: t.arg({ type: DayType, required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) throw new Error("Not authenticated");

      const submissions = await ctx.prisma.submission.findMany({
        where: {
          userId: user.id,
          Card: {
            day: args.day,
          },
        },
      });
      return submissions;
    },
  }),
);
