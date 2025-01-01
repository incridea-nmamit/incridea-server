import { builder } from "~/graphql/builder";
import { prisma } from "~/utils/db";

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
  goldCount: CountClass;
  silverCount: CountClass;
  bronzeCount: CountClass;
  constructor(
    collegeId: number,
    championshipPoints: number,
    collegeName: string,
    goldCount: CountClass,
    silverCount: CountClass,
    bronzeCount: CountClass,
  ) {
    this.collegeName = collegeName;
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

      const collegePoints = colleges.map((collegeItem) => {
        const collegeData: ChampionshipPointsClass = {
          collegeId: collegeItem.id,
          collegeName: collegeItem.name,
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
          if (winner.Event.tier === "GOLD") {
            collegeData.goldCount[winner.type]++;
          } else if (winner.Event.tier === "SILVER") {
            collegeData.silverCount[winner.type]++;
          } else if (winner.Event.tier === "BRONZE") {
            collegeData.bronzeCount[winner.type]++;
          }
        });

        return collegeData;
      });
      return collegePoints;
    },
  }),
);
/*
const data : Object = 
    {
        "data": {
          "collegesWithStats": [
            {
              "id": "1",
              "name": "Engineering College A",
              "championshipPoints": 120,
              "goldCount": {
                "WINNER": 10,
                "RUNNER_UP": 2,
                "SECOND_RUNNER_UP": 3
              },
              "silverCount": {
                "WINNER": 0,
                "RUNNER_UP": 1,
                "SECOND_RUNNER_UP": 3
              },
              "bronzeCount": {
                "WINNER": 0,
                "RUNNER_UP": 1,
                "SECOND_RUNNER_UP": 3
              }
            }
          ]
        }
      }
*/
