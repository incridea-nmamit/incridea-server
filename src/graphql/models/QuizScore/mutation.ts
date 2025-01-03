import { builder } from "~/graphql/builder";

const OptionsType = builder.inputType("SelectedOptions", {
  fields: (t) => ({
    id: t.string({ required: true }),
    value: t.string({ required: true }),
    questionId: t.string({ required: true }),
  }),
});

builder.mutationField("submitQuiz", (t) =>
  t.prismaField({
    type: "QuizScore",
    args: {
      teamId: t.arg.int({ required: true }),
      quizId: t.arg.string({ required: true }),
      selectedAnswers: t.arg({ type: [OptionsType], required: true }),
    },
    errors: {
      types: [Error],
    },

    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }

      const quiz = await ctx.prisma.quiz.findFirst({
        where: {
          id: args.quizId,
        },
      });

      if (!quiz) {
        throw new Error("Quiz not found");
      }

      let points = 0;

      for (const answer of args.selectedAnswers) {
        await ctx.prisma.quizSubmission.create({
          data: {
            teamId: args.teamId,
            optionId: answer.id,
          },
        });
        const ans = await ctx.prisma.options.findFirst({
          where: {
            id: answer.id,
          },
        });
        if (ans?.isAnswer) {
          points = points + quiz.points;
        }
      }

      const quizScore = await ctx.prisma.quizScore.create({
        data: {
          quizId: args.quizId,
          teamId: args.teamId,
          score: points,
        },
      });

      return quizScore;
    },
  }),
);
