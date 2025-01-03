import { builder } from "~/graphql/builder";

const OptionsType = builder.inputType("OptionsCreateInput", {
  fields: (t) => ({
    value: t.string({ required: true }),
    isAnswer: t.boolean({ required: true }),
  }),
});

const QuestionsType = builder.inputType("QuestionsCreateInput", {
  fields: (t) => ({
    id: t.string({ required: false }),
    question: t.string({ required: true }),
    description: t.string({ required: false }),
    isCode: t.boolean({ required: false }),
    options: t.field({ type: [OptionsType], required: false }),
    image: t.string({ required: false }),
    mode: t.string({ required: false }),
    createdAt: t.string({ required: false }),
  }),
});

builder.mutationField("createQuiz", (t) =>
  t.prismaField({
    type: "Quiz",
    args: {
      name: t.arg({ type: "String", required: true }),
      description: t.arg({ type: "String" }),
      roundId: t.arg({ type: "String", required: true }),
      eventId: t.arg({ type: "String", required: true }),
      startTime: t.arg({ type: "String", required: true }),
      endTime: t.arg({ type: "String", required: true }),
      points: t.arg({ type: "Int", required: true }),
      qualifyNext: t.arg({ type: "Int", required: true }),
      password: t.arg({ type: "String", required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }

      if (user.role !== "ORGANIZER")
        throw new Error("Not allowed to perform this action");

      const round = await ctx.prisma.round.findUnique({
        where: {
          eventId_roundNo: {
            eventId: Number(args.eventId),
            roundNo: Number(args.roundId),
          },
        },
      });

      if (!round) throw new Error("Round not found");

      const data = await ctx.prisma.quiz.upsert({
        where: {
          eventId_roundId: {
            eventId: Number(args.eventId),
            roundId: Number(args.roundId),
          },
        },
        create: {
          name: args.name,
          description: args.description,
          startTime: new Date(args.startTime),
          endTime: new Date(args.endTime),
          password: args.password,
          Round: {
            connect: {
              eventId_roundNo: {
                eventId: Number(args.eventId),
                roundNo: Number(args.roundId),
              },
            },
          },
        },
        update: {
          name: args.name,
          description: args.description,
          startTime: new Date(args.startTime),
          endTime: new Date(args.endTime),
          points: args.points,
          qualifyNext: args.qualifyNext,
          password: args.password,
        },
        ...query,
      });

      return data;
    },
  }),
);

builder.mutationField("updateQuiz", (t) =>
  t.prismaField({
    type: "Quiz",
    args: {
      quizId: t.arg({ type: "String", required: true }),
      questions: t.arg({ type: [QuestionsType], required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }

      if (user.role !== "ORGANIZER")
        throw new Error("Not allowed to perform this action");

      console.log(args.questions);
      for (const q of args.questions) {
        if (q.mode === "new") {
          await ctx.prisma.question.create({
            data: {
              question: q.question,
              description: q.description,
              isCode: q.isCode ?? false,
              image: q.image,
              createdAt: q.createdAt ? new Date(q.createdAt) : new Date(),
              Quiz: { connect: { id: args.quizId } },
              options: {
                create: q.options?.map((option) => ({
                  value: option.value,
                  isAnswer: option.isAnswer,
                })),
              },
            },
          });
        } else if (q.mode === "edit") {
          await ctx.prisma.question.update({
            where: { id: q.id ? q.id : "" },
            data: {
              question: q.question,
              description: q.description,
              isCode: q.isCode ?? false,
              image: q.image,
              options: {
                deleteMany: {},
                create: q.options?.map((option) => ({
                  value: option.value,
                  isAnswer: option.isAnswer,
                })),
              },
            },
          });
        } else if (q.mode === "delete") {
          await ctx.prisma.question.delete({
            where: { id: q.id ? q.id : "" },
          });
        }
      }

      const data = await ctx.prisma.quiz.findUnique({
        where: {
          id: args.quizId,
        },
        ...query,
      });

      if (!data) {
        throw new Error("Quiz not found");
      }

      return data;
    },
  }),
);

builder.mutationField("updateQuizStatus", (t) =>
  t.prismaField({
    type: "Quiz",
    args: {
      quizId: t.arg({ type: "String", required: true }),
      allowAttempts: t.arg({ type: "Boolean", required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }

      if (user.role !== "ORGANIZER")
        throw new Error("Not allowed to perform this action");

      const data = await ctx.prisma.quiz.update({
        where: {
          id: args.quizId,
        },
        data: {
          allowAttempts: args.allowAttempts,
        },
        ...query,
      });
      return data;
    },
  }),
);
