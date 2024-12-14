import { builder } from "~/graphql/builder";

builder.mutationField("addBranch", (t) =>
  t.prismaField({
    type: "Branch",
    args: {
      name: t.arg({
        type: "String",
        required: true,
      }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) throw new Error("Not Authenticated");
      if (user.role !== "ADMIN") throw new Error("No Permission");
      return ctx.prisma.branch.create({
        data: {
          name: args.name,
        },
      });
    },
  }),
);
