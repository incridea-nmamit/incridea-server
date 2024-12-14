import { builder } from "~/graphql/builder";

builder.queryField("judgeGetTeamsByRound", (t) =>
  t.prismaField({
    type: ["Team"],
    args: {
      eventId: t.arg.int({ required: true }),
      roundId: t.arg.int({ required: true }),
    },
    smartSubscription: true,
    subscribe: (subscription, root, args, ctx, info) => {
      subscription.register(`TEAM_UPDATED/${args.eventId}-${args.roundId}`);
    },
    resolve: async (query, root, args, ctx, info) => {
      const teams = await ctx.prisma.team.findMany({
        where: {
          eventId: args.eventId,
          roundNo: {
            gte: args.roundId,
          },
          confirmed: true,
          attended: true,
        },
        ...query,
      });
      return teams;
    },
  }),
);
