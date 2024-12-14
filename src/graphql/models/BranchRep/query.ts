import { builder } from "~/graphql/builder";

builder.queryField("eventsByBranchRep", (t) =>
  t.prismaField({
    type: ["Event"],
    args: {
      branchRepId: t.arg({
        type: "ID",
        required: true,
      }),
    },
    resolve: (query, root, args, ctx, info) => {
      return ctx.prisma.event.findMany({
        where: {
          Branch: {
            BranchReps: {
              some: {
                userId: Number(args.branchRepId),
              },
            },
          },
        },
        ...query,
      });
    },
  }),
);
