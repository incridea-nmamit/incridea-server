import { LAAnswerStatus } from "@prisma/client";

import { builder } from "~/graphql/builder";

builder.enumType(LAAnswerStatus, {
  name: "LAAnswerStatus",
});

builder.prismaObject("LASubmission", {
  fields: (t) => ({
    id: t.exposeID("id"),
    teamId: t.exposeID("teamId"),
    team: t.relation("Team"),
    questionId: t.exposeID("questionId"),
    Question: t.relation("Question"),
    value: t.expose("value", {
      type: "String",
      nullable: false,
    }),
    isRight: t.expose("isRight", {
      type: LAAnswerStatus,
    }),
    createdAt: t.expose("createdAt", {
      type: "DateTime",
    }),
    updatedAt: t.expose("updatedAt", {
      type: "DateTime",
    }),
  }),
});
