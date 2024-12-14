import { builder } from "~/graphql/builder";

builder.prismaObject("MCQSubmission", {
  fields: (t) => ({
    id: t.exposeID("id"),
    teamId: t.exposeID("teamId"),
    team: t.relation("Team"),
    OptionId: t.exposeID("optionId"),
    options: t.relation("Options"),
    createdAt: t.expose("createdAt", {
      type: "DateTime",
    }),
    updatedAt: t.expose("updatedAt", {
      type: "DateTime",
    }),
  }),
});
