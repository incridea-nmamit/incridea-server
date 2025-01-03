import { builder } from "~/graphql/builder";

builder.queryField("teamsByRound", (t) =>
  t.prismaConnection({
    type: "Team",
    cursor: "id",
    args: {
      roundNo: t.arg({
        type: "Int",
        required: true,
      }),
      eventId: t.arg({
        type: "ID",
        required: true,
      }),
      contains: t.arg.string({ required: false }),
    },
    resolve: async (query, root, args, ctx, info) => {
      const filter = args.contains ?? "";
      const user = await ctx.user;
      if (!user) throw new Error("Not Authenticated");
      if (user.role !== "JURY") {
        if (user.role !== "ORGANIZER" && user.role !== "JUDGE") return [];
        const isOrganizerOrJudge = await ctx.prisma.event.findMany({
          where: {
            id: Number(args.eventId),
            OR: [
              {
                Organizers: {
                  some: {
                    userId: user.id,
                  },
                },
              },
              {
                Rounds: {
                  some: {
                    Judges: {
                      some: {
                        userId: user.id,
                      },
                    },
                  },
                },
              },
            ],
          },
        });
        if (isOrganizerOrJudge.length === 0) {
          return [];
        }
      }
      const teams = ctx.prisma.team.findMany({
        where: {
          roundNo: {
            gte: args.roundNo,
          },
          eventId: Number(args.eventId),
          confirmed: true,
          OR: [
            {
              name: {
                contains: filter,
              },
            },
            {
              TeamMembers: {
                some: {
                  User: {
                    OR: [
                      {
                        name: {
                          contains: filter,
                        },
                      },
                      {
                        email: {
                          contains: filter,
                        },
                      },
                    ],
                  },
                },
              },
            },
          ],
        },
        ...query,
      });
      return teams;
    },
  }),
);

builder.queryField("teamDetails", (t) =>
  t.prismaField({
    type: "Team",
    args: {
      id: t.arg({ type: "ID", required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const data = await ctx.prisma.team.findUnique({
        where: {
          id: Number(args.id),
        },
        ...query,
      });
      if (!data) throw new Error("Team not found");
      return data;
    },
  }),
);

// check if user is in team for particular event and retrun team details
builder.queryField("myTeam", (t) =>
  t.prismaField({
    type: "Team",
    args: {
      eventId: t.arg({ type: "ID", required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) throw new Error("Not authenticated");
      const data = await ctx.prisma.team.findFirst({
        where: {
          eventId: Number(args.eventId),
          TeamMembers: {
            some: {
              userId: user.id,
            },
          },
        },
        ...query,
      });
      if (!data) throw new Error("Team not found");
      return data;
    },
  }),
);

builder.queryField("attemptQuiz", (t) =>
  t.prismaField({
    type: "Team",
    args: {
      quizId: t.arg({
        type: "ID",
        required: true,
      }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) throw new Error("Not authenticated");

      if (user.role !== "PARTICIPANT")
        throw new Error("Permission to attempt the quiz is denied");

      const quiz = await ctx.prisma.quiz.findUnique({
        where: {
          id: args.quizId,
          allowAttempts: true,
        },
        include: {
          Round: true,
          QuizScores: true,
        },
      });

      if (!quiz) throw new Error("Quiz not found");

      if (quiz.Round.completed) throw new Error("Round has been completed");

      const quizScore = await ctx.prisma.quizScore.findFirst({
        where: {
          quizId: args.quizId,
          Team: {
            leaderId: user.id,
          },
        },
      });

      if (quizScore) throw new Error("You have already attempted the quiz");

      const team = await ctx.prisma.team.findFirst({
        where: {
          leaderId: user.id,
          eventId: quiz.eventId,
        },
        ...query,
      });

      if (!team) throw new Error("You have not registered for this event");

      if (!team.confirmed) throw new Error("Your team has not been confirmed");

      if (team.roundNo !== quiz.Round.roundNo)
        throw new Error("You have not qualified for this round");

      return team;
    },
  }),
);
