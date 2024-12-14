import { builder } from "~/graphql/builder";

builder.queryField("rounds", (t) =>
  t.prismaField({
    type: ["Round"],
    resolve: (query, root, args, ctx, info) => {
      return ctx.prisma.round.findMany({
        ...query,
      });
    },
  }),
);

builder.queryField("roundsByEvent", (t) =>
  t.prismaField({
    type: ["Round"],
    args: {
      eventId: t.arg({ type: "ID", required: true }),
    },
    resolve: (query, root, args, ctx, info) => {
      return ctx.prisma.round.findMany({
        where: {
          eventId: Number(args.eventId),
        },
        ...query,
      });
    },
  }),
);
