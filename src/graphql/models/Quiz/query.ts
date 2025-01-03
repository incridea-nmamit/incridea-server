import { builder } from "~/graphql/builder";

class Option {
  id: string;
  answer: string;

  constructor(id: string, answer: string) {
    this.id = id;
    this.answer = answer;
  }
}

builder.objectType(Option, {
  name: "Option",
  fields: (t) => ({
    id: t.exposeString("id"),
    answer: t.exposeString("answer"),
  }),
});

class AllSubmissions {
  userId: string;
  question: string;
  qId: string;
  options: Option[] | null;
  mcqAns: string | null;
  isRight: boolean | null;

  constructor(
    options: {
      id: string;
      answer: string;
    }[],
    mcqAns: string | null,
    isRight: boolean | null,
    userId: string,
    question: string,
    qId: string,
  ) {
    this.options = options;
    this.mcqAns = mcqAns;
    this.isRight = isRight;
    this.userId = userId;
    this.question = question;
    this.qId = qId;
  }
}

const AllSubmissionsType = builder.objectType(AllSubmissions, {
  name: "AllSubmissions",
  fields: (t) => ({
    options: t.expose("options", { nullable: true, type: [Option] }),
    mcqAns: t.exposeString("mcqAns", { nullable: true }),
    isRight: t.exposeBoolean("isRight", { nullable: true }),
    userId: t.exposeString("userId"),
    question: t.exposeString("question"),
    qId: t.exposeString("qId"),
  }),
});

builder.queryField("getAllQuizSubmissions", (t) =>
  t.field({
    type: [AllSubmissionsType],
    args: {
      quizId: t.arg({
        type: "String",
        required: true,
      }),
      eventId: t.arg({
        type: "String",
        required: true,
      }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }
      if (user.role !== "ORGANIZER") {
        throw new Error("Not authorized");
      }
      const event = await ctx.prisma.event.findUnique({
        where: {
          id: Number(args.eventId),
        },
        include: {
          Organizers: true,
        },
      });
      if (!event) {
        throw new Error("Event not found");
      }
      if (!event.Organizers.find((o) => o.userId === user.id)) {
        throw new Error("Not authorized");
      }

      const quizSubmissions: {
        options: Option[] | null;
        userId: string;
        question: string;
        qId: string;
        mcqAns: string | null;
        isRight: boolean | null;
        fitbAns: string | null;
        laAns: string | null;
        longAnsIsRight: string | null;
      }[] = [];

      const submissions = await ctx.prisma.quizSubmission.findMany({
        where: {
          Options: {
            Question: {
              quizId: args.quizId,
            },
          },
        },
        include: {
          Options: {
            include: {
              Question: {
                include: {
                  options: true,
                },
              },
            },
          },
        },
      });

      const mcq = submissions.map((item) => {
        const optionsArr = item?.Options?.Question?.options?.map((item) => {
          return {
            id: item?.id,
            answer: item?.value,
          };
        });

        return {
          options: optionsArr,
          userId: item?.teamId?.toString(),
          question: item?.Options?.Question?.question,
          qId: item?.Options?.questionId,
          mcqAns: item?.Options?.value,
          isRight: item?.Options?.isAnswer,
          fitbAns: null,
          laAns: null,
          longAnsIsRight: null,
        };
      });
      quizSubmissions.push(...mcq);

      quizSubmissions.sort((a, b) => Number(a.userId) - Number(b.userId));

      return quizSubmissions;
    },
  }),
);

builder.queryField("getQuizByEventRound", (t) =>
  t.prismaField({
    type: "Quiz",
    args: {
      eventId: t.arg({
        type: "Int",
        required: true,
      }),
      roundId: t.arg({
        type: "Int",
        required: true,
      }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      try {
        const user = await ctx.user;
        if (!user) {
          throw new Error("Not authenticated");
        }
        if (user.role !== "ORGANIZER") {
          throw new Error("Not authorized");
        }
        const event = await ctx.prisma.event.findUnique({
          where: {
            id: Number(args.eventId),
          },
          include: {
            Organizers: true,
          },
        });
        if (!event) {
          throw new Error("Event not found");
        }
        if (!event.Organizers.find((o) => o.userId === user.id)) {
          throw new Error("Not authorized");
        }

        const data = await ctx.prisma.quiz.findUnique({
          where: {
            eventId_roundId: {
              eventId: Number(args.eventId),
              roundId: Number(args.roundId),
            },
          },
          ...query,
        });
        console.log(data);
        if (!data) {
          throw new Error("There is no quiz in this event");
        }
        return data;
      } catch (error) {
        console.log(error);
        throw new Error("Something went wrong");
      }
    },
  }),
);

builder.queryField("getSubmissionByUser", (t) =>
  t.field({
    type: [AllSubmissionsType],
    args: {
      teamId: t.arg({
        type: "String",
        required: true,
      }),
      quizId: t.arg({
        type: "String",
        required: true,
      }),
    },
    resolve: async (root, args, ctx, info) => {
      try {
        const quizSubmissions: {
          options: Option[] | null;
          userId: string;
          question: string;
          qId: string;
          mcqAns: string | null;
          isRight: boolean | null;
        }[] = [];
        const submissions = await ctx.prisma.quizSubmission.findMany({
          where: {
            teamId: Number(args.teamId),
            Options: {
              Question: {
                quizId: args.quizId,
              },
            },
          },
          include: {
            Options: {
              include: {
                Question: {
                  include: {
                    options: true,
                  },
                },
              },
            },
          },
        });

        const mcq = submissions.map((item) => {
          const optionsArr = item?.Options?.Question?.options?.map((item) => {
            return {
              id: item?.id,
              answer: item?.value,
            };
          });

          return {
            options: optionsArr,
            userId: item?.teamId?.toString(),
            question: item?.Options?.Question?.question,
            qId: item?.Options?.questionId,
            mcqAns: item?.Options?.value,
            isRight: item?.Options?.isAnswer,
            fitbAns: null,
            laAns: null,
            longAnsIsRight: null,
          };
        });
        quizSubmissions.push(...mcq);

        quizSubmissions.sort((a, b) => Number(a.userId) - Number(b.userId));

        return quizSubmissions;
      } catch (error) {
        console.log(error);
        throw new Error("Something went wrong");
      }
    },
  }),
);

builder.queryField("getQuizById", (t) =>
  t.prismaField({
    type: "Quiz",
    args: {
      quizId: t.arg({
        type: "String",
        required: true,
      }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      try {
        const user = await ctx.user;
        if (!user) {
          throw new Error("Not authenticated");
        }

        if (!(user.role === "ORGANIZER" || user.role === "PARTICIPANT")) {
          throw new Error("Not authorized");
        }

        const quiz = await ctx.prisma.quiz.findUnique({
          where: {
            id: args.quizId,
            allowAttempts: user.role === "ORGANIZER" ? false : true,
          },
        });

        if (!quiz) {
          throw new Error("Quiz not found");
        }

        return quiz;
      } catch (error) {
        console.log(error);
        throw new Error("Something went wrong");
      }
    },
  }),
);

builder.queryField("verifyQuizPassword", (t) =>
  t.prismaField({
    type: "Quiz",
    args: {
      quizId: t.arg({ type: "String", required: true }),
      password: t.arg({ type: "String", required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) throw new Error("Not authenticated");

      if (user.role !== "PARTICIPANT")
        throw new Error("Not allowed to attempt the quiz");

      const quiz = await ctx.prisma.quiz.findUnique({
        where: {
          id: args.quizId,
        },
      });

      if (!quiz) {
        throw new Error("Quiz not found");
      }

      if (quiz.password === args.password) {
        return quiz;
      } else {
        throw new Error("Invalid password");
      }
    },
  }),
);
