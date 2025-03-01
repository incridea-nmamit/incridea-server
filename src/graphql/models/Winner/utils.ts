import { CONSTANT } from "~/constants";
import { prisma } from "~/utils/db";
const getChampionshipEligibilityForAllColleges = async (): Promise<
  Map<number, { isEligible: boolean; name: string; championshipPoints: number; techLastRound: number; nonTechLastRound: number }>
> => {
  // Get the final round number for each event
  const finalRounds = await prisma.round.groupBy({
    by: ["eventId"],
    _max: { roundNo: true },
  });
  const finalRoundMap = new Map(
    finalRounds
      .filter((round) => round._max.roundNo !== null)
      .map((round) => [round.eventId, round._max.roundNo!]),
  );

  // Get all teams from relevant events
  const allTeams = await prisma.team.findMany({
    where: {
      Event: {
        published: true,
        category: { 
          in: ["TECHNICAL", "NON_TECHNICAL", "CORE"] 
        },
      },
    },
    select: {
      id: true,
      eventId: true,
      roundNo: true,
      Event: {
        select: {
          id: true,
          category: true,
        },
      },
      TeamMembers: {
        select: {
          User: {
            select: { collegeId: true },
          },
        },
      },
    },
  });

  const collegeParticipationMap = new Map<
    number,
    {
      tech: Set<number>;
      nonTech: Set<number>;
    }
  >();

  // iterate over all teams
  allTeams.forEach((team) => {
    const { TeamMembers, Event, eventId, roundNo } = team;

    // Check if this team has reached the final round for its event
    const finalRoundForEvent = finalRoundMap.get(eventId);
    if (!finalRoundForEvent || roundNo !== finalRoundForEvent) {
      return;
    }

    // Extract unique college IDs from team members
    const collegeIds = new Set(
      TeamMembers.map(({ User }) => User.collegeId).filter(
        (id): id is number => id !== null,
      ),
    );

    // For each unique college in the team
    collegeIds.forEach((collegeId) => {
      if (!collegeParticipationMap.has(collegeId)) {
        collegeParticipationMap.set(collegeId, {
          tech: new Set(),
          nonTech: new Set(),
        });
      }

      const collegeEventCounts = collegeParticipationMap.get(collegeId)!;

      // Count each event only once per college
        if (Event.category === "TECHNICAL" || Event.id === CONSTANT.CORE_TECHNICAL_EVENT_ID) {
        collegeEventCounts.tech.add(Event.id);
      } else if (Event.category === "NON_TECHNICAL" || (Event.id !== CONSTANT.CORE_TECHNICAL_EVENT_ID && Event.category === "CORE")) {
        collegeEventCounts.nonTech.add(Event.id);
      }
    });
  });

  // Get all colleges
  const colleges = await prisma.college.findMany({
    select: {
      id: true,
      name: true,
      championshipPoints: true,
    },
  });

  // Determine eligibility for each college
  const eligibilityMap = new Map<
    number,
    { isEligible: boolean; name: string; championshipPoints: number; techLastRound: number; nonTechLastRound: number }
  >();

  colleges.forEach((college) => {
    const collegeEvents = collegeParticipationMap.get(college.id);

    const techCount = collegeEvents ? collegeEvents.tech.size : 0;
    const nonTechCount = collegeEvents ? collegeEvents.nonTech.size : 0;

    eligibilityMap.set(college.id, {
      isEligible: techCount >= 3 && nonTechCount >= 2,
      name: college.name,
      championshipPoints: college.championshipPoints,
      techLastRound: techCount,
      nonTechLastRound: nonTechCount,
    });
  });
  return eligibilityMap;
};
export { getChampionshipEligibilityForAllColleges };
