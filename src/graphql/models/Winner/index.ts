import { WinnerType } from "@prisma/client";

import { builder } from "~/graphql/builder";
import "~/graphql/models/Winner/mutation";
import "~/graphql/models/Winner/query";
import "~/graphql/models/Winner/subscription";

builder.enumType(WinnerType, {
  name: "WinnerType",
});

builder.prismaObject("Winners", {
  fields: (t) => ({
    id: t.exposeID("id"),
    team: t.relation("Team"),
    event: t.relation("Event"),
    type: t.expose("type", {
      type: WinnerType,
    }),
  }),
});
