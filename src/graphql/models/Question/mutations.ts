import { type QuestionType } from "@prisma/client";

import { builder } from "~/graphql/builder";

builder.mutationField("createQuestion", (t) =>
  t.prismaField({
    type: "Question",
    args: {
      quizId: t.arg({ type: "String", required: true }),
      question: t.arg({ type: "String", required: true }),
      points: t.arg({ type: "Int", required: true }),
      negativePoint: t.arg({ type: "Int", required: true }),
      type: t.arg({ type: "String", required: true }),
      image: t.arg({ type: "String", required: false }),
      options: t.arg({ type: "String", required: false }),
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
      let temp = [{ id: "" }];
      if (args.options) {
        temp = args.options?.split(",").map((option) => ({
          id: option,
        }));
      }
      const data = await ctx.prisma.question.create({
        data: {
          question: args.question,
          Quiz: {
            connect: {
              id: args.quizId,
            },
          },
          points: args.points,
          image: args.image,
          negativePoints: args.negativePoint,
          options: {
            connect: temp,
          },
          questionType: args.type as QuestionType,
        },
        ...query,
      });
      return data;
    },
  }),
);
