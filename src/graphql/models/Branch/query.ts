import { builder } from "~/graphql/builder";

builder.queryField("getBranch", (t) =>
  t.prismaField({
    type: "Branch",
    args: {
      id: t.arg({
        type: "ID",
        required: true,
      }),
    },
    resolve: (query, root, args, ctx, info) => {
      return ctx.prisma.branch.findUniqueOrThrow({
        where: {
          id: Number(args.id),
        },
      });
    },
  }),
);

builder.queryField("getBranches", (t) =>
  t.prismaField({
    type: ["Branch"],
    resolve: (query, root, args, ctx, info) => {
      return ctx.prisma.branch.findMany({
        ...query,
      });
    },
  }),
);
