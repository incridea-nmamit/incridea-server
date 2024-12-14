import { CriteriaType } from "@prisma/client";

import { builder } from "~/graphql/builder";
import "~/graphql/models/Criteria/mutation";

builder.enumType(CriteriaType, {
  name: "CriteriaType",
});

builder.prismaObject("Criteria", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    type: t.expose("type", {
      type: CriteriaType,
    }),
  }),
});
