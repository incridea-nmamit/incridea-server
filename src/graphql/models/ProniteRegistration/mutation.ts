import { builder } from "~/graphql/builder";

builder.mutationField("registerPronite", (t) =>
  t.prismaField({
    type: "ProniteRegistration",
    args: {
      userId: t.arg.id(),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, parent, args, ctx) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: Number(args.userId),
        },
      });
      if (!user) {
        throw new Error("No such user exists");
      }
      if (user.id == 466) {
        throw new Error("Does not deserve to register for pronite");
      }

      const authUser = await ctx.user;

      if (!authUser) throw new Error("Not authenticated");
      // ID of pronite email used for scanning
      if (authUser.id != 5181)
        throw new Error("permission denied, wrong account");
      if (
        !["PARTICIPANT", "ORGANIZER", "BRANCH_REP", "ADMIN", "JURY"].includes(
          user.role,
        )
      ) {
        throw new Error("User did not register for the fest");
      }

      //set day here for pronite
      const pronite = await ctx.prisma.proniteRegistration.findUnique({
        where: {
          userId_proniteDay: {
            userId: Number(args.userId),
            proniteDay: "Day2",
          },
        },
      });

      if (pronite) {
        // 2024-02-23T04:35:38.014Z convert to 10:03:59 AM
        const date = new Date(pronite.createdAt).toLocaleString(undefined, {
          timeZone: "Asia/Kolkata",
        });
        throw new Error(`User already registered for pronite at ${date}`);
      }
      //set day here for pronite
      const createdPronite = await ctx.prisma.proniteRegistration.create({
        data: {
          userId: Number(args.userId),
          proniteDay: "Day2",
        },
        ...query,
      });
      return createdPronite;
    },
  }),
);
