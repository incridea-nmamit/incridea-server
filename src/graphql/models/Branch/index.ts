import { builder } from "~/graphql/builder";
import "~/graphql/models/Branch/mutation";
import "~/graphql/models/Branch/query";

builder.prismaObject("Branch", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    branchReps: t.relation("BranchReps"),
    events: t.relation("Event"),
  }),
});
