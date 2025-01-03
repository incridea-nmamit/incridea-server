import { builder } from "~/graphql/builder";
import "~/graphql/models/Quiz/query";
import "~/graphql/models/Quiz/mutations";

builder.prismaObject("Quiz", {
  fields: (t) => ({
    id: t.exposeID("id"),
    roundNo: t.exposeInt("roundId"),
    eventId: t.exposeID("eventId"),
    name: t.expose("name", {
      type: "String",
      nullable: false,
    }),
    description: t.expose("description", {
      type: "String",
      nullable: true,
    }),
    startTime: t.expose("startTime", {
      type: "DateTime",
      nullable: false,
    }),
    endTime: t.expose("endTime", {
      type: "DateTime",
      nullable: false,
    }),
    updatedAt: t.expose("updatedAt", {
      type: "DateTime",
      nullable: false,
    }),
    questions: t.relation("Questions"),
    password: t.expose("password", {
      type: "String",
      nullable: false,
    }),
    quizScores: t.relation("QuizScores"),
    points: t.exposeInt("points"),
    qualifyNext: t.exposeInt("qualifyNext"),
    allowAttempts: t.exposeBoolean("allowAttempts"),
  }),
});
