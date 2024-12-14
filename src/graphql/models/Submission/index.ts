import { builder } from "~/graphql/builder";
import "~/graphql/models/Submission/mutation";
import "~/graphql/models/Submission/query";

builder.prismaObject("Submission", {
  fields: (t) => ({
    userId: t.exposeID("userId"),
    cardId: t.exposeID("cardId"),
    image: t.exposeString("image"),
    card: t.relation("Card"),
    user: t.relation("User"),
  }),
});
