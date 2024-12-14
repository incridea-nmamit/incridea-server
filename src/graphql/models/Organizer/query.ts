import { builder } from "~/graphql/builder";

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
          Organizers: {
            some: {
              userId: Number(args.organizerId),
            },
          },
        },
        ...query,
      });
    },
  }),
);
