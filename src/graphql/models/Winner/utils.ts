type Tier = "GOLD" | "SILVER" | "BRONZE";
type winnerType = "WINNER" | "RUNNER_UP" | "SECOND_RUNNER_UP";

const allocatePoints = (tier: Tier, winnerType: winnerType): number => {
  const pointsTable: Record<Tier, Record<winnerType, number>> = {
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

  return pointsTable[tier][winnerType];
};

export { allocatePoints };
