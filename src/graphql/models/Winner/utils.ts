import { prisma } from "~/utils/db";

type Tier = "GOLD" | "SILVER" | "BRONZE";
type winnerType = "WINNER" | "RUNNER_UP" | "SECOND_RUNNER_UP";

type PointsTable = {
  [key in Tier]: {
    [key in winnerType]: number;
  };
};

const pointsTable: PointsTable = {
  GOLD: {
    WINNER: 500,
    RUNNER_UP: 450,
    SECOND_RUNNER_UP: 400,
  },
  SILVER: {
    WINNER: 350,
    RUNNER_UP: 300,
    SECOND_RUNNER_UP: 250,
  },
  BRONZE: {
    WINNER: 200,
    RUNNER_UP: 150,
    SECOND_RUNNER_UP: 100,
  },
};

const allocatePoints = (tier: Tier, winnerType: winnerType): number => {
  return pointsTable[tier][winnerType];
};

const checkChampionshipEligibility = async (collegeId: number) => {
  const finalRounds = await prisma.round.groupBy({
    by: ["eventId"],
    _max: { roundNo: true },
  });

  const eventFinalRoundMap = new Map(
    finalRounds
      .filter((round) => round._max.roundNo != null)
      .map((round) => [round.eventId, round._max.roundNo!]),
  );

  const eligibilityTeams = await prisma.team.findMany({
    where: {
      collegeId: collegeId,
      Event: {
        published: true,
        category: {
          in: ["TECHNICAL", "NON_TECHNICAL"],
        },
        Rounds: {
          some: {
            roundNo: {
              in: Array.from(eventFinalRoundMap.values()),
            },
          },
        },
      },
    },
    include: {
      Event: true,
    },
  });

  const techCount = eligibilityTeams.filter(
    (team) => team.Event.category === "TECHNICAL",
  ).length;
  const nonTechCount = eligibilityTeams.filter(
    (team) => team.Event.category === "NON_TECHNICAL",
  ).length;

  return techCount >= 3 && nonTechCount >= 2;
};

export { allocatePoints, checkChampionshipEligibility };
