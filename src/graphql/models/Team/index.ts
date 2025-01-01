import { builder } from "~/graphql/builder";
import "~/graphql/models/Team/mutation";
import "~/graphql/models/Team/query";
import "~/graphql/models/Team/subscription";

builder.prismaObject("Team", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    event: t.relation("Event"),
    roundNo: t.exposeInt("roundNo"),
    members: t.relation("TeamMembers"),
    confirmed: t.exposeBoolean("confirmed"),
    attended: t.exposeBoolean("attended"),
    college: t.relation("College", {
      nullable: true,
    }),
    leaderId: t.exposeInt("leaderId", {
      nullable: true,
    }),
  }),
});

builder.prismaObject("TeamMember", {
  fields: (t) => ({
    user: t.relation("User"),
    team: t.relation("Team"),
  }),
});
