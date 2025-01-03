import { CollegeType } from "@prisma/client";

import { builder } from "~/graphql/builder";
import "~/graphql/models/College/mutation";
import "~/graphql/models/College/query";

builder.enumType(CollegeType, {
  name: "CollegeType",
});

builder.prismaObject("College", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    championshipPoints: t.exposeInt("championshipPoints"),
  }),
});
