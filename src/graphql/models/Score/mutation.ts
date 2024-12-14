import { builder } from "~/graphql/builder";

builder.mutationField("addScore", (t) =>
  t.prismaField({
    type: "Scores",
    args: {
      teamId: t.arg.int({ required: true }),
      criteriaId: t.arg.int({ required: true }),
      score: t.arg.string({ required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not Authenticated");
      }
      if (user.role !== "JUDGE") {
        throw new Error("Not Authorized");
      }
      const isJudgeOfRound = await ctx.prisma.criteria.findMany({
        where: {
          id: args.criteriaId,
          Round: {
            Judges: {
              some: {
                userId: user.id,
              },
            },
          },
        },
      });
      if (isJudgeOfRound.length === 0) {
        throw new Error("Not Authorized");
      }
      // create or update
      const score = await ctx.prisma.scores.upsert({
        where: {
          teamId_criteriaId_judgeId: {
            teamId: args.teamId,
            criteriaId: args.criteriaId,
            judgeId: user.id,
          },
        },
        update: {
          score: args.score,
        },
        create: {
          teamId: args.teamId,
          criteriaId: args.criteriaId,
          score: args.score,
          judgeId: user.id,
        },
        ...query,
      });
      return score;
    },
  }),
);

builder.mutationField("addComment", (t) =>
  t.prismaField({
    type: "Comments",
    args: {
      teamId: t.arg.int({ required: true }),
      comment: t.arg.string({ required: true }),
      roundNo: t.arg.int({ required: true }),
      eventId: t.arg.int({ required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not Authenticated");
      }
      if (user.role !== "JUDGE") {
        throw new Error("Not Authorized");
      }
      const isJudgeOfRound = await ctx.prisma.round.findMany({
        where: {
          roundNo: args.roundNo,
          eventId: args.eventId,
          Judges: {
            some: {
              userId: user.id,
            },
          },
        },
      });
      if (isJudgeOfRound.length === 0) {
        throw new Error("Not Authorized");
      }
      // create or update
      const comment = await ctx.prisma.comments.upsert({
        where: {
          teamId_eventId_roundNo_judgeId: {
            teamId: args.teamId,
            eventId: args.eventId,
            roundNo: args.roundNo,
            judgeId: user.id,
          },
        },
        update: {
          comment: args.comment,
        },
        create: {
          teamId: args.teamId,
          eventId: args.eventId,
          roundNo: args.roundNo,
          judgeId: user.id,
          comment: args.comment,
        },
        ...query,
      });
      return comment;
    },
  }),
);
