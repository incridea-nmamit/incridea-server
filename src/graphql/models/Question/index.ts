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
    image: t.expose("image", {
      type: "String",
      nullable: true,
    }),
    options: t.relation("options"),
    createdAt: t.expose("createdAt", {
      type: "DateTime",
      nullable: false,
    }),
  }),
});
