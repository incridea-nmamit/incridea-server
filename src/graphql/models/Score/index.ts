import { builder } from "~/graphql/builder";
import "~/graphql/models/Score/mutation";
import "~/graphql/models/Score/query";

builder.prismaObject("Scores", {
  fields: (t) => ({
    teamId: t.exposeID("teamId"),
    criteriaId: t.exposeID("criteriaId"),
    score: t.exposeString("score"),
    team: t.relation("Team"),
    criteria: t.relation("Criteria"),
    judge: t.relation("Judge"),
  }),
});

builder.prismaObject("Comments", {
  fields: (t) => ({
    teamId: t.exposeID("teamId"),
    eventId: t.exposeID("eventId"),
    roundNo: t.exposeInt("roundNo"),
    comment: t.exposeString("comment"),
    team: t.relation("Team"),
    round: t.relation("Round"),
    judge: t.relation("Judge"),
  }),
});
