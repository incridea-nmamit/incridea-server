import { builder } from "~/graphql/builder";
import { prisma } from "~/utils/db";
import { getChampionshipEligibilityForAllColleges } from "./utils";

builder.queryField("winnersByEvent", (t) =>
  t.prismaField({
    type: ["Winners"],
    errors: {
      types: [Error],
    },
    args: {
      eventId: t.arg.id({ required: true }),
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) throw new Error("Not Authenticated");
      if (!["JUDGE", "JURY"].includes(user.role))
        throw new Error("You are not authorized");

      try {
        return ctx.prisma.winners.findMany({
          where: {
            eventId: Number(args.eventId),
          },
          ...query,
        });
      } catch (e) {
        console.log(e);
        throw new Error("Something went wrong! Couldn't fetch winners");
      }
    },
  }),
);

builder.queryField("allWinners", (t) =>
  t.prismaField({
    type: ["Winners"],
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) throw new Error("Not Authenticated");
      if (!["JUDGE", "JURY"].includes(user.role))
        throw new Error("You are not authorized");

      try {
        return ctx.prisma.winners.findMany({
          ...query,
        });
      } catch (e) {
        console.log(e);
        throw new Error("Something went wrong! Couldn't fetch winners");
      }
    },
  }),
);

class CountClass {
  WINNER: number;
  RUNNER_UP: number;
  SECOND_RUNNER_UP: number;
  constructor(WINNER: number, RUNNER_UP: number, SECOND_RUNNER_UP: number) {
    this.WINNER = WINNER;
    this.RUNNER_UP = RUNNER_UP;
    this.SECOND_RUNNER_UP = SECOND_RUNNER_UP;
  }
}

class ChampionshipPointsClass {
  collegeId: number;
  collegeName: string;
  championshipPoints: number;
  techCount: number;
  nonTechCount: number;
  techLastRound: number;
  nonTechLastRound: number;
  coreCount: number;
  diamondCount: CountClass;
  goldCount: CountClass;
  silverCount: CountClass;
  bronzeCount: CountClass;
  isEligible: boolean;
  constructor(
    collegeId: number,
    isEligible: boolean,
    championshipPoints: number,
    collegeName: string,
    techCount: number,
    nonTechCount: number,
    coreCount: number,
    techLastRound: number,
    nonTechLastRound: number,
    goldCount: CountClass,
    diamondCount: CountClass,
    silverCount: CountClass,
    bronzeCount: CountClass,
  ) {
    this.collegeName = collegeName;
    this.isEligible = isEligible;
    this.collegeId = collegeId;
    this.championshipPoints = championshipPoints;
    this.diamondCount = diamondCount;
    this.techCount = techCount;
    this.nonTechCount = nonTechCount;
    this.coreCount = coreCount;
    this.techLastRound = techLastRound;
    this.nonTechLastRound = nonTechLastRound;
    this.goldCount = goldCount;
    this.silverCount = silverCount;
    this.bronzeCount = bronzeCount;
  }
}

const Count = builder.objectType(CountClass, {
  name: "Counts",
  fields: (t) => ({
    winner: t.exposeInt("WINNER"),
    runner_up: t.exposeInt("RUNNER_UP"),
    second_runner_up: t.exposeInt("SECOND_RUNNER_UP"),
  }),
});

const ChampionshipPoints = builder.objectType(ChampionshipPointsClass, {
  name: "ChampionshipPoint",
  fields: (t) => ({
    id: t.exposeInt("collegeId"),
    name: t.exposeString("collegeName"),
    isEligible: t.exposeBoolean("isEligible"),
    championshipPoints: t.exposeInt("championshipPoints"),
    techCount: t.exposeInt("techCount"),
    nonTechCount: t.exposeInt("nonTechCount"),
    coreCount: t.exposeInt("coreCount"),
    techLastRound: t.exposeInt("techLastRound"),
    nonTechLastRound: t.exposeInt("nonTechLastRound"),
    diamondCount: t.expose("diamondCount", {
      type: Count,
    }),
    goldCount: t.expose("goldCount", {
      type: Count,
    }),
    silverCount: t.expose("silverCount", {
      type: Count,
    }),
    bronzeCount: t.expose("bronzeCount", {
      type: Count,
    }),
  }),
});

builder.queryField("getChampionshipLeaderboard", (t) =>
  t.field({
    type: [ChampionshipPoints],
    errors: {
      types: [Error],
    },
    resolve: async (root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) throw new Error("Not authenticated");

      if (user.role !== "JURY" && user.role !== "ADMIN")
        throw new Error("Not authorized");

      const eligibilityMap = await getChampionshipEligibilityForAllColleges();

      const winners = await prisma.winners.findMany({
        where: {
          Event: {
            category: {
              not: "SPECIAL",
            },
          },
        },
        include: {
          Team: {
            select: {
              TeamMembers: {
                take: 1,
                select: {
                  User: {
                    select: {
                      College: {
                        select: {
                          id: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          Event: {
            select: {
              tier: true,
              category: true,
            },
          },
        },
      });

      const collegePoints = Array.from(eligibilityMap.entries()).map(
        ([collegeId, { isEligible, name, championshipPoints, techLastRound, nonTechLastRound }]) =>
          new ChampionshipPointsClass(
            collegeId,
            isEligible,
            championshipPoints,
            name,
            0,
            0,
            0,
            techLastRound,
            nonTechLastRound,
            new CountClass(0, 0, 0),
            new CountClass(0, 0, 0),
            new CountClass(0, 0, 0),
            new CountClass(0, 0, 0),
          ),
      );

      winners.forEach((winner) => {
        const collegeId = winner.Team.TeamMembers[0]?.User.College?.id;
        if (!collegeId) return;

        const collegeData = collegePoints.find(
          (c) => c.collegeId === collegeId,
        );
        if (!collegeData) return;

        switch (winner.Event.category) {
          case "CORE":
            collegeData.coreCount++;
            break;
          case "TECHNICAL":
            collegeData.techCount++;
            break;
          case "NON_TECHNICAL":
            collegeData.nonTechCount++;
            break;
        }

        switch (winner.Event.tier) {
          case "DIAMOND":
            collegeData.diamondCount[winner.type]++;
            break;
          case "GOLD":
            collegeData.goldCount[winner.type]++;
            break;
          case "SILVER":
            collegeData.silverCount[winner.type]++;
            break;
          case "BRONZE":
            collegeData.bronzeCount[winner.type]++;
            break;
        }
      });

      return collegePoints;
    },
  }),
);
