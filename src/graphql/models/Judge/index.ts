import { builder } from "~/graphql/builder";
import "~/graphql/models/Judge/mutation";
import "~/graphql/models/Judge/query";

builder.prismaObject("Judge", {
  fields: (t) => ({
    user: t.relation("User"),
    round: t.relation("Round"),
  }),
});
