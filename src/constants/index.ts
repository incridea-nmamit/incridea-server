import {
  type EventCategory,
  type EventTier,
  type WinnerType,
} from "@prisma/client";
import { AVATARS } from "~/constants/avatars";
import { type Avatar } from "~/constants/type";

const CONSTANT = {
  REG_AMOUNT_IN_INR: {
    INTERNAL: 350,
    EXTERNAL: 450,
    OTHER: 1000000000,
  },
  WINNER_POINTS: {
    USER: {
      TECHNICAL: {
        WINNER: 100,
        RUNNER_UP: 75,
        SECOND_RUNNER_UP: 50,
      },
      NON_TECHNICAL: {
        WINNER: 100,
        RUNNER_UP: 75,
        SECOND_RUNNER_UP: 50,
      },
      CORE: {
        WINNER: 150,
        RUNNER_UP: 100,
        SECOND_RUNNER_UP: 75,
      },
      SPECIAL: {
        WINNER: 100,
        RUNNER_UP: 75,
        SECOND_RUNNER_UP: 50,
      },
    } as { [key in EventCategory]: { [key in WinnerType]: number } },
    COLLEGE: {
      DIAMOND: {
        WINNER: 600,
        RUNNER_UP: 550,
        SECOND_RUNNER_UP: 500,
      },
      GOLD: {
        WINNER: 450,
        RUNNER_UP: 400,
        SECOND_RUNNER_UP: 350,
      },
      SILVER: {
        WINNER: 300,
        RUNNER_UP: 250,
        SECOND_RUNNER_UP: 200,
      },
      BRONZE: {
        WINNER: 150,
        RUNNER_UP: 100,
        SECOND_RUNNER_UP: 50,
      },
    } as { [key in EventTier]: { [key in WinnerType]: number } },
  },
  PEOPLE_WHO_DONT_DESERVE_TO_BE_IN_PRONITE: [466] as number[],
  ID_OF_PRONITE_SCANNING_USER: 669,
  PRONITE: {
    DAY_1: new Date("28 February 2025 00:00 GMT+0530"),
    DAY_2: new Date("01 March 2025 00:00 GMT+0530"),
  },
  AVATARS: AVATARS as Avatar[],
};

export { CONSTANT };
