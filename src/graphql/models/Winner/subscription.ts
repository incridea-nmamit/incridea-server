import { builder } from "~/graphql/builder";
import { prisma } from "~/utils/db";
import { checkChampionshipEligibility } from "./utils";

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
  isEligible: boolean;
  championshipPoints: number;
  techCount: number;
  nonTechCount: number;
  coreCount: number;
  goldCount: CountClass;
  silverCount: CountClass;
  bronzeCount: CountClass;
  constructor(
    collegeId: number,
    championshipPoints: number,
    collegeName: string,
    isEligible: boolean,
    techCount: number,
    nonTechCount: number,
    coreCount: number,
    goldCount: CountClass,
    silverCount: CountClass,
    bronzeCount: CountClass,
  ) {
    this.collegeName = collegeName;
    this.isEligible = isEligible;
    this.techCount = techCount;
    this.nonTechCount = nonTechCount;
    this.coreCount = coreCount;
    this.collegeId = collegeId;
    this.championshipPoints = championshipPoints;
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
    championshipPoints: t.exposeInt("championshipPoints"),
    isEligible: t.exposeBoolean("isEligible"),
    techCount: t.exposeInt("techCount"),
    nonTechCount: t.exposeInt("nonTechCount"),
    coreCount: t.exposeInt("coreCount"),
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

builder.queryField("getChampionshipPoints", (t) =>
  t.field({
    type: [ChampionshipPoints],
    errors: {
      types: [Error],
    },
    smartSubscription: true,
    subscribe: (subscription, root, args, ctx, info) => {
      subscription.register(`CHAMPIONSHIP_UPDATED`);
    },
    resolve: async (root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }
      if (user.role !== "JURY") {
        throw new Error("Not authorized");
      }
      const winners = await prisma.winners.findMany({
        include: {
          Team: {
            include: {
              College: true,
            },
          },
          Event: true,
        },
      });

      const colleges = await prisma.college.findMany();

      const collegePoints = await Promise.all(
        colleges.map(async (collegeItem) => {
          const IsEligible = await checkChampionshipEligibility(collegeItem.id);
          const eachCollegeData: ChampionshipPointsClass = {
            collegeId: collegeItem.id,
            collegeName: collegeItem.name,
            isEligible: IsEligible,
            techCount: 0,
            nonTechCount: 0,
            coreCount: 0,
            championshipPoints: collegeItem.championshipPoints,
            goldCount: { WINNER: 0, RUNNER_UP: 0, SECOND_RUNNER_UP: 0 },
            silverCount: { WINNER: 0, RUNNER_UP: 0, SECOND_RUNNER_UP: 0 },
            bronzeCount: { WINNER: 0, RUNNER_UP: 0, SECOND_RUNNER_UP: 0 },
          };

          const collegeWinners = winners.filter(
            (winner) => winner.Team.College?.id === collegeItem.id,
          );

          collegeWinners.forEach((winner) => {
            if (!winner.Event) return;

            //update tech, nonTech and Core tally
            if (winner.Event.category === "TECHNICAL") {
              eachCollegeData.techCount++;
            } else if (winner.Event.category === "NON_TECHNICAL") {
              eachCollegeData.nonTechCount++;
            } else if (winner.Event.category === "CORE") {
              eachCollegeData.coreCount++;
            }

            //update Gold, Silver and Bronze tally
            if (winner.Event.tier === "GOLD") {
              eachCollegeData.goldCount[winner.type]++;
            } else if (winner.Event.tier === "SILVER") {
              eachCollegeData.silverCount[winner.type]++;
            } else if (winner.Event.tier === "BRONZE") {
              eachCollegeData.bronzeCount[winner.type]++;
            }
          });

          return eachCollegeData;
        }),
      );
      return collegePoints;
    },
  }),
);
