import { builder } from "~/graphql/builder";
import { prisma } from "~/utils/db";
import { checkChampionshipEligibility } from "./utils";

class ChampionshipPointsClass {
  collegeId: number;
  collegeName: string;
  championshipPoints: number;
  techCount: number;
  nonTechCount: number;
  coreCount: number;
  goldCount: number;
  silverCount: number;
  bronzeCount: number;
  constructor(
    collegeId: number,
    championshipPoints: number,
    collegeName: string,
    techCount: number,
    nonTechCount: number,
    coreCount: number,
    goldCount: number,
    silverCount: number,
    bronzeCount: number,
  ) {
    this.collegeName = collegeName;
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

const ChampionshipPoints = builder.objectType(ChampionshipPointsClass, {
  name: "ChampionshipPoint",
  fields: (t) => ({
    id: t.exposeInt("collegeId"),
    name: t.exposeString("collegeName"),
    championshipPoints: t.exposeInt("championshipPoints"),
    techCount: t.exposeInt("techCount"),
    nonTechCount: t.exposeInt("nonTechCount"),
    coreCount: t.exposeInt("coreCount"),
    goldCount: t.exposeInt("goldCount"),
    silverCount: t.exposeInt("silverCount"),
    bronzeCount: t.exposeInt("bronzeCount"),
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
      if (user.role !== "ADMIN") {
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
          if (IsEligible) {
            const eachCollegeData: ChampionshipPointsClass = {
              collegeId: collegeItem.id,
              collegeName: collegeItem.name,
              techCount: 0,
              nonTechCount: 0,
              coreCount: 0,
              championshipPoints: collegeItem.championshipPoints,
              goldCount: 0,
              silverCount: 0,
              bronzeCount: 0,
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
                eachCollegeData.goldCount++;
              } else if (winner.Event.tier === "SILVER") {
                eachCollegeData.silverCount++;
              } else if (winner.Event.tier === "BRONZE") {
                eachCollegeData.bronzeCount++;
              }
            });

            return eachCollegeData;
          } else return;
        }),
      );
      return collegePoints.filter((collegePoint) => collegePoint !== undefined);
    },
  }),
);
