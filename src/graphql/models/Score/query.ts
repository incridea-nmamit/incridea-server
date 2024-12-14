import { CriteriaType } from "@prisma/client";

import { builder } from "~/graphql/builder";

builder.queryField("getScore", (t) =>
  t.prismaField({
    type: "Scores",
    args: {
      criteriaId: t.arg({ type: "ID", required: true }),
      teamId: t.arg({ type: "ID", required: true }),
      roundNo: t.arg({ type: "Int", required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }
      if (!["JUDGE", "JURY"].includes(user.role)) {
        throw new Error("Not authorized");
      }
      const data = await ctx.prisma.scores.findUniqueOrThrow({
        where: {
          teamId_criteriaId_judgeId: {
            teamId: Number(args.teamId),
            criteriaId: Number(args.criteriaId),
            judgeId: user.id,
          },
        },
        ...query,
      });
      return data;
    },
  }),
);

builder.queryField("getComment", (t) =>
  t.prismaField({
    type: "Comments",
    args: {
      roundNo: t.arg({ type: "Int", required: true }),
      eventId: t.arg({ type: "ID", required: true }),
      teamId: t.arg({ type: "ID", required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }
      if (!["JUDGE", "JURY"].includes(user.role)) {
        throw new Error("Not authorized");
      }
      const data = await ctx.prisma.comments.findUniqueOrThrow({
        where: {
          teamId_eventId_roundNo_judgeId: {
            teamId: Number(args.teamId),
            eventId: Number(args.eventId),
            roundNo: Number(args.roundNo),
            judgeId: user.id,
          },
        },
        ...query,
      });
      return data;
    },
  }),
);

class TotalScoreClass {
  totalScore: number;
  judgeScore: number;
  criteriaType: CriteriaType;
  teamId: number;
  constructor(
    totalScore: number,
    judgeScore: number,
    teamId: number,
    criteriaType: CriteriaType,
  ) {
    this.totalScore = totalScore;
    this.judgeScore = judgeScore;
    this.teamId = teamId;
    this.criteriaType = criteriaType;
  }
}

const TotalScore = builder.objectType(TotalScoreClass, {
  name: "TotalScores",
  fields: (t) => ({
    totalScore: t.exposeFloat("totalScore"),
    judgeScore: t.exposeFloat("judgeScore"),
    teamId: t.exposeInt("teamId"),
    criteriaType: t.exposeString("criteriaType"),
  }),
});

builder.queryField("getTotalScores", (t) =>
  t.field({
    type: [TotalScore],
    args: {
      eventId: t.arg({ type: "ID", required: true }),
      roundNo: t.arg({ type: "Int", required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }
      if (!["JUDGE", "JURY"].includes(user.role)) {
        throw new Error("Not authorized");
      }
      if (user.role == "JUDGE") {
        // check if the judge is assigned to the event
        const judge = await ctx.prisma.judge.findUnique({
          where: {
            userId_eventId_roundNo: {
              userId: user.id,
              eventId: Number(args.eventId),
              roundNo: Number(args.roundNo),
            },
          },
        });
        if (!judge) {
          throw new Error("Not authorized");
        }
      }
      const teams = await ctx.prisma.team.findMany({
        where: {
          roundNo: Number(args.roundNo),
          eventId: Number(args.eventId),
        },
      });
      const judges = await ctx.prisma.judge.findMany({
        where: {
          eventId: Number(args.eventId),
          roundNo: Number(args.roundNo),
        },
      });
      const criteria = await ctx.prisma.criteria.findFirst({
        where: {
          eventId: Number(args.eventId),
          roundNo: Number(args.roundNo),
        },
      });

      const total_scores = teams.map(async (team) => {
        const scores = await ctx.prisma.scores.findMany({
          where: {
            teamId: team.id,
            judgeId: {
              in: judges.map((judge) => judge.userId),
            },
          },
        });

        const totalScore = scores.reduce(
          (acc, score) => acc + (score.score ? Number(score.score) : 0),
          0,
        );
        const judgeScore = scores.reduce((acc, score) => {
          if (score.judgeId === user.id) {
            return acc + (score.score ? Number(score.score) : 0);
          }
          return acc;
        }, 0);
        return {
          totalScore,
          judgeScore,
          teamId: team.id,
          criteriaType: criteria?.type ?? CriteriaType.NUMBER,
        };
      });
      return Promise.all(total_scores);
    },
  }),
);

class CriteriaClass {
  criteriaId: number;
  criteriaName: string;
  score: number;
  criteriaType: CriteriaType;
  constructor(
    criteriaName: string,
    criteriaId: number,
    score: number,
    criteriaType: CriteriaType,
  ) {
    this.criteriaId = criteriaId;
    this.score = score;
    this.criteriaName = criteriaName;
    this.criteriaType = criteriaType;
  }
}

class JudgeClass {
  judgeName: string;
  judgeId: number;
  criteria: CriteriaClass[];
  constructor(judgeName: string, judgeId: number, criteria: CriteriaClass[]) {
    this.judgeName = judgeName;
    this.judgeId = judgeId;
    this.criteria = criteria;
  }
}

class ScoreSheetClass {
  teamName: string;
  teamId: number;
  teamScore: number;
  judges: JudgeClass[];
  constructor(
    teamName: string,
    teamId: number,
    teamScore: number,
    judges: JudgeClass[],
  ) {
    this.teamName = teamName;
    this.teamId = teamId;
    this.teamScore = teamScore;
    this.judges = judges;
  }
}

const Criteria = builder.objectType(CriteriaClass, {
  name: "CriteriaJuryView",
  fields: (t) => ({
    criteriaId: t.exposeInt("criteriaId"),
    score: t.exposeFloat("score"),
    criteriaName: t.exposeString("criteriaName"),
    criteriaType: t.expose("criteriaType", {
      type: CriteriaType,
    }),
  }),
});

const Judge = builder.objectType(JudgeClass, {
  name: "JudgeJuryView",
  fields: (t) => ({
    judgeName: t.exposeString("judgeName"),
    judgeId: t.exposeInt("judgeId"),
    criteria: t.expose("criteria", {
      type: [Criteria],
    }),
  }),
});

const ScoreSheet = builder.objectType(ScoreSheetClass, {
  name: "ScoreSheetJuryView",
  fields: (t) => ({
    teamName: t.exposeString("teamName"),
    teamId: t.exposeInt("teamId"),
    teamScore: t.exposeFloat("teamScore"),
    judges: t.expose("judges", {
      type: [Judge],
    }),
  }),
});

builder.queryField("getScoreSheetJuryView", (t) =>
  t.field({
    type: [ScoreSheet],
    args: {
      eventId: t.arg({ type: "ID", required: true }),
      roundNo: t.arg({ type: "Int", required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }
      if (user.role !== "JURY") {
        throw new Error("Not authorized");
      }
      const teams = await ctx.prisma.team.findMany({
        where: {
          roundNo: {
            gte: Number(args.roundNo),
          },
          eventId: Number(args.eventId),
          confirmed: true,
          attended: true,
        },
      });
      const judges = await ctx.prisma.judge.findMany({
        where: {
          eventId: Number(args.eventId),
          roundNo: Number(args.roundNo),
        },
        include: {
          User: true,
        },
      });
      const criteria = await ctx.prisma.criteria.findMany({
        where: {
          eventId: Number(args.eventId),
          roundNo: Number(args.roundNo),
        },
      });
      const scoreSheet = teams.map(async (team) => {
        const judgesScore = judges.map(async (judge) => {
          const scores = await ctx.prisma.scores.findMany({
            where: {
              teamId: team.id,
              judgeId: judge.userId,
            },
          });
          const criteriaScore = criteria.map((criterion) => {
            const score = scores.find(
              (score) => score.criteriaId === criterion.id,
            );
            return {
              criteriaId: criterion.id,
              score: score ? Number(score.score) : 0,
              criteriaName: criterion.name,
              criteriaType: criterion.type,
            };
          });
          return {
            judgeName: judge.User.name,
            judgeId: judge.userId,
            criteria: criteriaScore,
          };
        });
        const scores = await ctx.prisma.scores.findMany({
          where: {
            teamId: team.id,
            judgeId: {
              in: judges.map((judge) => judge.userId),
            },
          },
        });
        const totalScore = scores.reduce(
          (acc, score) => acc + (score.score ? Number(score.score) : 0),
          0,
        );
        return {
          teamName: team.name,
          teamId: team.id,
          teamScore: totalScore,
          judges: await Promise.all(judgesScore),
        };
      });
      return Promise.all(scoreSheet);
    },
  }),
);
