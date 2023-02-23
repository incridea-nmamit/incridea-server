import { builder } from "../../builder";

builder.queryField("eventByOrganizer", (t) =>
  t.prismaField({
    type: ["Event"],
    args: {
      organizerId: t.arg({
        type: "ID",
        required: true,
      }),
    },
    resolve: (query, root, args, ctx, info) => {
      return ctx.prisma.event.findMany({
        where: {
          id: Number(args.organizerId),
        },
      });
    },
  })
);
