import { builder } from "~/graphql/builder";

builder.queryField("colleges", (t) =>
  t.prismaField({
    type: ["College"],
    resolve: (query, root, args, ctx, info) => {
      return ctx.prisma.college.findMany({
        ...query,
      });
    },
  }),
);
