import { builder } from "~/graphql/builder";
import "~/graphql/models/Question/query";
import "~/graphql/models/Question/mutations";

builder.prismaObject("Question", {
  fields: (t) => ({
    id: t.exposeID("id"),
    quizId: t.exposeID("quizId"),
    quiz: t.relation("Quiz"),
    question: t.expose("question", {
      type: "String",
      nullable: false,
    }),
    description: t.expose("description", {
      type: "String",
      nullable: true,
    }),
    isCode: t.expose("isCode", {
      type: "Boolean",
      nullable: false,
    }),
    point: t.exposeInt("points"),
    negativePoint: t.exposeInt("negativePoints"),
    image: t.expose("image", {
      type: "String",
      nullable: true,
    }),
    options: t.relation("options"),
  }),
});
