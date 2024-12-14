import { builder } from "~/graphql/builder";
import "~/graphql/models/Organizer/mutation";
import "~/graphql/models/Organizer/query";

builder.prismaObject("Organizer", {
  fields: (t) => ({
    eventId: t.exposeID("eventId"),
    user: t.relation("User"),
  }),
});
