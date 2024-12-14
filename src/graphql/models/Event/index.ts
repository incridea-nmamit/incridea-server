import { EventCategory, EventType } from "@prisma/client";

import { builder } from "~/graphql/builder";
import "~/graphql/models/Event/mutation";
import "~/graphql/models/Event/query";

builder.enumType(EventType, {
  name: "EventType",
});

builder.enumType(EventCategory, {
  name: "EventCategory",
});

builder.prismaObject("Event", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    fees: t.exposeInt("fees"),
    description: t.expose("description", {
      type: "String",
      nullable: true,
    }),
    venue: t.expose("venue", {
      type: "String",
      nullable: true,
    }),
    image: t.expose("image", {
      type: "String",
      nullable: true,
    }),
    branch: t.relation("Branch"),
    published: t.exposeBoolean("published"),
    minTeamSize: t.exposeInt("minTeamSize"),
    maxTeamSize: t.exposeInt("maxTeamSize"),
    maxTeams: t.exposeInt("maxTeams", {
      nullable: true,
    }),
    organizers: t.relation("Organizers"),
    eventType: t.expose("eventType", {
      type: EventType,
    }),
    teams: t.relation("Teams"),
    rounds: t.relation("Rounds"),
    category: t.expose("category", {
      type: EventCategory,
    }),
    winner: t.relation("Winner", {
      nullable: true,
    }),
  }),
});
