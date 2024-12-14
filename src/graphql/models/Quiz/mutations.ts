import { builder } from "~/graphql/builder";

builder.mutationField("createQuiz", (t) =>
  t.prismaField({
    type: "Quiz",
    args: {
      name: t.arg({ type: "String", required: true }),
      description: t.arg({ type: "String", required: true }),
      roundId: t.arg({ type: "String", required: true }),
      eventId: t.arg({ type: "String", required: true }),
      startTime: t.arg({ type: "String", required: true }),
      endTime: t.arg({ type: "String", required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      //Get user from context
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }

      if (user.role !== "ORGANIZER")
        throw new Error("Not allowed to perform this action");

      //create accommodation request
      const data = await ctx.prisma.quiz.create({
        data: {
          name: args.name,
          description: args.description,
          startTime: new Date(args.startTime),
          endTime: new Date(args.endTime),
          Round: {
            connect: {
              eventId_roundNo: {
                eventId: Number(args.eventId),
                roundNo: Number(args.roundId),
              },
            },
          },
        },
        ...query,
      });
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
      password: t.arg({ type: "String", required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      //Get user from context
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }

      if (user.role !== "ORGANIZER")
        throw new Error("Not allowed to perform this action");

      //create accommodation request
      const data = await ctx.prisma.quiz.update({
        where: {
          id: args.quizId,
        },
        data: {
          allowAttempts: args.allowAttempts,
          password: args.password,
        },
        ...query,
      });
      return data;
    },
  }),
);
