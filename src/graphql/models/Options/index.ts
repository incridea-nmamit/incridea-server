import { builder } from "~/graphql/builder";

builder.prismaObject("Options", {
  fields: (t) => ({
    id: t.exposeID("id"),
    questionId: t.exposeID("questionId"),
    question: t.relation("Question"),
    value: t.expose("value", {
      type: "String",
      nullable: false,
    }),
    isAnswer: t.exposeBoolean("isAnswer"),
    QuizSubmissions: t.relation("Submissions"),
  }),
});
