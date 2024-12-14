import { builder } from "~/graphql/builder";

builder.queryField("getRoundStatus", (t) =>
  t.prismaField({
    type: "Round",
    args: {
      eventId: t.arg({ type: "ID", required: true }),
      roundNo: t.arg({ type: "Int", required: true }),
    },
    errors: {
      types: [Error],
    },
    smartSubscription: true,
    subscribe: (subscriptions, parent, args, info) => {
      subscriptions.register(`STATUS_UPDATE/${args.eventId}-${args.roundNo}`);
    },
    resolve: async (query, root, args, ctx, info) => {
      return ctx.prisma.round.findUniqueOrThrow({
        where: {
          eventId_roundNo: {
            eventId: Number(args.eventId),
            roundNo: Number(args.roundNo),
          },
        },
        ...query,
      });
    },
  }),
);
