import { QuestionType } from "@prisma/client";

import { builder } from "~/graphql/builder";
import "~/graphql/models/Question/query";
import "~/graphql/models/Question/mutations";

builder.enumType(QuestionType, {
  name: "QuestionType",
});

builder.prismaObject("Question", {
  fields: (t) => ({
    id: t.exposeID("id"),
    quizId: t.exposeID("quizId"),
    quiz: t.relation("Quiz"),
    question: t.expose("question", {
      type: "String",
      nullable: false,
    }),
    point: t.exposeInt("points"),
    negativePoint: t.exposeInt("negativePoints"),
    image: t.expose("image", {
      type: "String",
      nullable: true,
    }),
    questionType: t.expose("questionType", {
      type: QuestionType,
    }),
    options: t.relation("options"),
    LASubmissions: t.relation("LASubmissions"),
  }),
});
