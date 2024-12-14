import { builder } from "~/graphql/builder";
import "~/graphql/models/BranchRep/mutation";
import "~/graphql/models/BranchRep/query";

builder.prismaObject("BranchRep", {
  fields: (t) => ({
    userId: t.exposeID("userId"),
    branchId: t.exposeID("branchId"),
    user: t.relation("User"),
  }),
});
