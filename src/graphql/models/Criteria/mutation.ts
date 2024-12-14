import { CriteriaType } from "@prisma/client";

import { builder } from "~/graphql/builder";

const CreateCriteriaInput = builder.inputType("CreateCriteriaInput", {
  fields: (t) => ({
    name: t.string({ required: false }),
    type: t.field({
      type: CriteriaType,
      required: false,
    }),
    roundNo: t.int({ required: true }),
    eventId: t.id({ required: true }),
  }),
});

// 1. Create Criteria - Organizers
builder.mutationField("createCriteria", (t) =>
  t.prismaField({
    type: "Criteria",
    args: {
      data: t.arg({
        type: CreateCriteriaInput,
        required: true,
      }),
    },

    errors: {
      types: [Error],
    },

    resolve: async (query, root, args, ctx, info) => {
      // 1. user related checks
      const user = await ctx.user;
      if (!user) throw new Error("Not authenticated");
      if (user?.role != "ORGANIZER" && user?.role != "JUDGE")
        throw new Error("Not Permitted");

      // 2. event related checks
      const event = await ctx.prisma.event.findUnique({
        where: {
          id: Number(args.data.eventId),
        },
        include: {
          Organizers: true,
          Rounds: {
            include: {
              Criteria: true,
              Judges: true,
            },
          },
        },
      });
      if (!event) throw new Error(`No Event with id ${args.data.eventId}`);

      if (!user) {
        throw new Error("Not Authenticated");
      }
      // check if the user is an organizer or a judge of the event
      if (
        user.role == "ORGANIZER" &&
        !event.Organizers.find((o) => o.userId === user.id)
      )
        throw new Error("Not Permitted");
      if (
        user.role == "JUDGE" &&
        !event.Rounds.find(
          (r) =>
            r.roundNo === args.data.roundNo &&
            r.Judges.find((j) => j.userId === user.id),
        )
      )
        throw new Error("Not Permitted");

      const criteriaNo =
        (event.Rounds.find((r) => r.roundNo === args.data.roundNo)?.Criteria
          .length ?? 0) + 1;

      return ctx.prisma.criteria.create({
        data: {
          eventId: Number(args.data.eventId),
          roundNo: Number(args.data.roundNo),
          name: args.data.name ? `${args.data.name}` : `Criteria ${criteriaNo}`,
          type: args.data.type ? args.data.type : CriteriaType.NUMBER,
        },
      });
    },
  }),
);

// 2. Delete Criteria - Organizers
builder.mutationField("deleteCriteria", (t) =>
  t.prismaField({
    type: "Criteria",
    args: {
      criteriaId: t.arg({
        type: "ID",
        required: true,
      }),
      eventId: t.arg({
        type: "ID",
        required: true,
      }),
      roundNo: t.arg({
        type: "Int",
        required: true,
      }),
    },

    errors: {
      types: [Error],
    },

    resolve: async (query, root, args, ctx, info) => {
      // 1. user related checks
      const user = await ctx.user;
      if (!user) throw new Error("Not authenticated");
      if (user.role != "ORGANIZER" && user.role != "JUDGE")
        throw new Error("Not Permitted");

      // 2. event related checks
      const event = await ctx.prisma.event.findUnique({
        where: {
          id: Number(args.eventId),
        },
        include: {
          Organizers: true,
          Rounds: {
            include: {
              Criteria: true,
              Judges: true,
            },
          },
        },
      });
      if (!event) throw new Error(`No Event with id ${args.eventId}`);

      // 3. organizer related checks
      if (
        user.role == "ORGANIZER" &&
        !event.Organizers.find((o) => o.userId === user.id)
      )
        throw new Error("Not Permitted");
      if (
        user.role == "JUDGE" &&
        !event.Rounds.find(
          (r) =>
            r.roundNo === args.roundNo &&
            r.Judges.find((j) => j.userId === user.id),
        )
      )
        throw new Error("Not Permitted");

      // 4. criteria related checks
      if (
        !event.Rounds.find((r) => r.roundNo === args.roundNo)?.Criteria.find(
          (c) => c.id === Number(args.criteriaId),
        )
      ) {
        throw new Error(`No Criteria with id ${args.criteriaId}!`);
      }

      try {
        const deletedCriteria = ctx.prisma.criteria.delete({
          where: {
            id: Number(args.criteriaId),
          },
          ...query,
        });
        return deletedCriteria;
      } catch (error) {
        console.log(error);
        throw new Error("Couldn't delete criteria");
      }
    },
  }),
);
