import { builder } from "~/graphql/builder";
import "~/graphql/models/Level/mutation";
import "~/graphql/models/Level/query";

builder.prismaObject("Level", {
  fields: (t) => ({
    id: t.exposeID("id"),
    point: t.exposeInt("point"),
    xp: t.relation("XP"),
  }),
});
