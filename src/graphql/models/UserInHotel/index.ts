import { AccommodationBookingStatus, Gender } from "@prisma/client";

import { builder } from "~/graphql/builder";
import "~/graphql/models/UserInHotel/mutation";
import "~/graphql/models/UserInHotel/query";

builder.enumType(Gender, {
  name: "Gender",
});

builder.enumType(AccommodationBookingStatus, {
  name: "AccommodationBookingStatus",
});

builder.prismaObject("UserInHotel", {
  fields: (t) => ({
    id: t.exposeID("id"),
    gender: t.expose("gender", {
      type: Gender,
    }),
    room: t.exposeString("room", {
      nullable: true,
    }),
    IdCard: t.exposeString("IdCard", {
      nullable: true,
    }),
    status: t.expose("status", {
      type: AccommodationBookingStatus,
    }),
    ac: t.exposeBoolean("AC"),
    hotel: t.relation("Hotel"),
    user: t.relation("User"), //Check if this can be included
    checkIn: t.expose("checkIn", {
      type: "DateTime",
      nullable: true,
    }),
    checkOut: t.expose("checkOut", {
      type: "DateTime",
      nullable: true,
    }),
    createdAt: t.expose("createdAt", {
      type: "DateTime",
      nullable: true,
    }),
    updatedAt: t.expose("updatedAt", {
      type: "DateTime",
      nullable: true,
    }),
  }),
});
