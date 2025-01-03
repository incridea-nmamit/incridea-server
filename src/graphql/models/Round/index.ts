import { builder } from "~/graphql/builder";
import "~/graphql/models/Round/mutation";
import "~/graphql/models/Round/query";
import "~/graphql/models/Round/subscription";

builder.prismaObject("Round", {
  fields: (t) => ({
    eventId: t.exposeID("eventId"),
    roundNo: t.exposeInt("roundNo"),
    completed: t.exposeBoolean("completed"),
    event: t.relation("Event"),
    date: t.expose("date", {
      type: "DateTime",
      nullable: true,
    }),
    criteria: t.relation("Criteria", {
      nullable: true,
    }),
    judges: t.relation("Judges"),
    quiz: t.relation("Quiz", {
      nullable: true,
    }),
    selectStatus: t.exposeBoolean("selectStatus"),
  }),
});
