import { builder } from "~/graphql/builder";

builder.mutationField("createCollege", (t) =>
  t.prismaField({
    type: "College",
    args: {
      name: t.arg({
        type: "String",
        required: true,
      }),
      details: t.arg({
        type: "String",
        required: false,
      }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (user?.role != "ADMIN") throw new Error("No Permission");
      return ctx.prisma.college.create({
        data: {
          name: args.name,
          details: args.details,
        },
      });
    },
  }),
);

builder.mutationField("removeCollege", (t) =>
  t.field({
    type: "String",
    args: {
      id: t.arg({
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
      if (user.role !== "ADMIN") throw new Error("No Permission");
      const college = await ctx.prisma.college.findMany({
        where: {
          id: Number(args.id),
        },
      });
      if (college.length == 0) throw new Error(`No college with id ${args.id}`);

      await ctx.prisma.college.delete({
        where: {
          id: Number(args.id),
        },
      });
      return "College deleted successfully";
    },
  }),
);
