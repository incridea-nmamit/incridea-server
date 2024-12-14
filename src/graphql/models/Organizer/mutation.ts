import { Role } from "@prisma/client";

import { builder } from "~/graphql/builder";

builder.mutationField("addOrganizer", (t) =>
  t.prismaField({
    type: "Organizer",
    args: {
      eventId: t.arg({
        type: "ID",
        required: true,
      }),
      userId: t.arg({
        type: "ID",
        required: true,
      }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) throw new Error("Not authenticated");
      if (user.role !== "BRANCH_REP") throw new Error("No Permission");
      const branch = await ctx.prisma.branchRep.findUnique({
        where: {
          userId: user.id,
        },
      });
      if (!branch) throw new Error(`No Branch Under ${user.name}`);
      const event = await ctx.prisma.event.findUnique({
        where: {
          id: Number(args.eventId),
        },
      });
      if (!event) throw new Error(`No Event with id ${args.eventId}`);
      if (event.branchId !== branch.branchId) throw new Error(`No Permission`);
      const data = await ctx.prisma.organizer.create({
        data: {
          Event: {
            connect: {
              id: Number(args.eventId),
            },
          },
          User: {
            connect: {
              id: Number(args.userId),
            },
          },
        },
      });
      const userRole = await ctx.prisma.user.findUnique({
        where: {
          id: Number(args.userId),
        },
      });

      if (data && userRole?.role === "PARTICIPANT") {
        await ctx.prisma.user.update({
          where: {
            id: Number(args.userId),
          },
          data: {
            role: "ORGANIZER",
          },
        });
      }
      return data;
    },
  }),
);

builder.mutationField("removeOrganizer", (t) =>
  t.field({
    type: "String",
    args: {
      eventId: t.arg({
        type: "ID",
        required: true,
      }),
      userId: t.arg({
        type: "ID",
        required: true,
      }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (root, args, ctx) => {
      const user = await ctx.user;
      if (!user) throw new Error("Not authenticated");
      if (user.role !== "BRANCH_REP") throw new Error("No Permission");
      const branch = await ctx.prisma.branchRep.findUnique({
        where: {
          userId: user.id,
        },
      });
      if (!branch) throw new Error(`No Branch Under ${user.name}`);
      const event = await ctx.prisma.event.findUnique({
        where: {
          id: Number(args.eventId),
        },
      });
      if (!event) throw new Error(`No Event with id ${args.eventId}`);
      if (event.branchId !== branch.branchId) throw new Error(`No Permission`);
      const userRole = await ctx.prisma.user.findUnique({
        where: {
          id: Number(args.userId),
        },
      });

      const count = await ctx.prisma.organizer.count({
        where: {
          userId: Number(args.userId),
        },
      });
      let role: Role = Role.USER;
      // chek if user is paid
      const successPaymentOrder = await ctx.prisma.paymentOrder.findMany({
        where: {
          userId: Number(args.userId),
          status: "SUCCESS",
        },
      });

      if (successPaymentOrder.length > 0) {
        role = Role.PARTICIPANT;
      }
      if (userRole?.role === "ORGANIZER" && !(count > 1)) {
        await ctx.prisma.user.update({
          where: {
            id: Number(args.userId),
          },
          data: {
            role: role,
          },
        });
      }
      await ctx.prisma.organizer.delete({
        where: {
          userId_eventId: {
            userId: Number(args.userId),
            eventId: Number(args.eventId),
          },
        },
      });
      return "removed Organizer";
    },
  }),
);
