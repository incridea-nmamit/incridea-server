import { builder } from "~/graphql/builder";

//add level
//Levels for custom easter eggs need to be added manually in the database
builder.mutationField("addLevel", (t) =>
  t.prismaField({
    type: "Level",
    args: {
      point: t.arg({ type: "Int", required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }
      //check if user admin
      if (user.role !== "ADMIN") {
        throw new Error("Not authorized");
      }
      const data = await ctx.prisma.level.create({
        data: {
          point: args.point,
        },
        ...query,
      });
      return data;
    },
  }),
);
