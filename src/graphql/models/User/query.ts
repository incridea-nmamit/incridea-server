import { builder } from "~/graphql/builder";
import { avatarList } from "~/constants";

builder.queryField("users", (t) =>
  t.prismaConnection({
    type: "User",
    cursor: "id",
    args: {
      contains: t.arg({
        type: "String",
        required: false,
      }),
    },
    resolve: (query, root, args, ctx, info) => {
      const filter = args.contains ?? "";
      return ctx.prisma.user.findMany({
        where: {
          role: {
            notIn: ["ADMIN", "JUDGE", "USER", "JURY"],
          },
          OR: [
            {
              email: {
                contains: filter,
              },
            },
            {
              name: {
                contains: filter,
              },
            },
            filter !== "" && !isNaN(Number(filter))
              ? {
                  id: Number(filter),
                }
              : {},
          ],
        },
        ...query,
      });
    },
  }),
);

builder.queryField("me", (t) =>
  t.prismaField({
    type: "User",
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }
      return user;
    },
  }),
);

builder.queryField("userById", (t) =>
  t.prismaField({
    type: "User",
    args: {
      id: t.arg({ type: "ID", required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      return ctx.prisma.user.findUniqueOrThrow({
        where: {
          id: Number(args.id),
        },
      });
    },
  }),
);

builder.queryField("totalRegistrations", (t) =>
  t.field({
    type: "Int",
    args: {
      date: t.arg({ type: "DateTime", required: false }),
      last: t.arg({ type: "Int", required: false }),
    },
    resolve: async (root, args, ctx) => {
      if (args.date) {
        return ctx.prisma.user.count({
          where: {
            role: {
              in: ["PARTICIPANT", "ORGANIZER", "BRANCH_REP"],
            },
            createdAt: {
              gte: args.date,
              lte: new Date(args.date.getTime() + 86400000),
            },
          },
        });
      }
      if (args.last) {
        return ctx.prisma.user.count({
          where: {
            role: {
              in: ["PARTICIPANT", "ORGANIZER", "BRANCH_REP"],
            },
            createdAt: {
              gte: new Date(
                new Date().getTime() - args.last * 86400000,
              ).toISOString(),
            },
          },
        });
      }
      return ctx.prisma.user.count({
        where: {
          role: {
            in: ["PARTICIPANT", "ORGANIZER", "BRANCH_REP"],
          },
        },
      });
    },
  }),
);

builder.queryField("getAvatars", (t) =>
  t.field({
    type: ["Avatar"],
    resolve: async (root, args, ctx) => {
      const user = await ctx.user;
      if (!user) throw new Error("Not authenticated");
      return avatarList;
    },
  }),
);
