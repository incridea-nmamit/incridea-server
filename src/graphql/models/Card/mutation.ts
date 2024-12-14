import { DayType } from "@prisma/client";

import { builder } from "~/graphql/builder";
import { checkIfPublicityMember } from "~/graphql/models/UserInHotel/utils";

//for easter eggs scanned using QR codes around the college for Publcity Committee
builder.mutationField("createCard", (t) =>
  t.prismaField({
    type: "Card",
    args: {
      clue: t.arg.string({ required: true }),
      day: t.arg({ type: DayType, required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) throw new Error("Not authenticated");
      if (!checkIfPublicityMember(user.id)) throw new Error("Not authorized");
      return ctx.prisma.card.create({
        data: {
          clue: args.clue,
          day: args.day,
        },
      });
    },
  }),
);

builder.mutationField("updateCard", (t) =>
  t.prismaField({
    type: "Card",
    args: {
      id: t.arg.id({ required: true }),
      clue: t.arg.string({ required: true }),
      day: t.arg({ type: DayType, required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) throw new Error("Not authenticated");
      if (!checkIfPublicityMember(user.id)) throw new Error("Not authorized");
      const card = await ctx.prisma.card.findUnique({
        where: {
          id: Number(args.id),
        },
      });
      if (!card) throw new Error("No such card");
      return ctx.prisma.card.update({
        where: {
          id: Number(args.id),
        },
        data: {
          clue: args.clue,
          day: args.day,
        },
      });
    },
  }),
);

builder.mutationField("deleteCard", (t) =>
  t.prismaField({
    type: "Card",
    args: {
      id: t.arg.id({ required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) throw new Error("Not authenticated");
      if (!checkIfPublicityMember(user.id)) throw new Error("Not authorized");
      const card = await ctx.prisma.card.findUnique({
        where: {
          id: Number(args.id),
        },
      });
      if (!card) throw new Error("No such card");
      return ctx.prisma.card.delete({
        where: {
          id: Number(args.id),
        },
      });
    },
  }),
);
