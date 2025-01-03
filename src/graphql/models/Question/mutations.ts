import { builder } from "~/graphql/builder";

const OptionsType = builder.inputType("OptionsCreateInput2", {
  fields: (t) => ({
    value: t.string({ required: true }),
    isAnswer: t.boolean({ required: true }),
  }),
});

builder.mutationField("createQuestion", (t) =>
  t.prismaField({
    type: "Question",
    args: {
      quizId: t.arg({ type: "String", required: true }),
      question: t.arg({ type: "String", required: true }),
      type: t.arg({ type: "String", required: false }),
      image: t.arg({ type: "String", required: false }),
      options: t.arg({ type: [OptionsType], required: false }),
      description: t.arg({ type: "String", required: false }),
      isCode: t.arg({ type: "Boolean", required: false }),
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

      const data = await ctx.prisma.question.create({
        data: {
          question: args.question,
          Quiz: {
            connect: {
              id: args.quizId,
            },
          },
          image: args.image,
          options: {
            create: args.options?.map((option) => ({
              value: option.value,
              isAnswer: option.isAnswer,
            })),
          },
          description: args.description,
          isCode: args.isCode ?? false,
        },
        ...query,
      });
      return data;
    },
  }),
);
