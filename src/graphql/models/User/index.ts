import { Role } from "@prisma/client";

import { builder } from "~/graphql/builder";
import "~/graphql/models/User/mutation";
import "~/graphql/models/User/query";

builder.enumType(Role, {
  name: "Role",
});

builder.prismaObject("User", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    email: t.exposeString("email"),
    role: t.expose("role", {
      type: Role,
    }),
    isVerified: t.exposeBoolean("isVerified"),
    createdAt: t.expose("createdAt", {
      type: "DateTime",
    }),
    phoneNumber: t.exposeString("phoneNumber", {
      nullable: true,
    }),
    profileImage: t.exposeString("profileImage", {
      nullable: true,
    }),
    college: t.relation("College", {
      nullable: true,
    }),
    xp: t.relation("XP", {
      nullable: true,
    }),
    hotel: t.relation("UserInHotel", {
      nullable: true,
    }),
  }),
});
