import { builder } from "~/graphql/builder";

//add xp to user
builder.mutationField("addXP", (t) =>
  t.prismaField({
    type: "XP",
    args: {
      levelId: t.arg({ type: "ID", required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }
      //check if user already has xp for level if they do dont add xp
      const xp = await ctx.prisma.xP.findUnique({
        where: {
          userId_levelId: {
            userId: Number(user.id),
            levelId: Number(args.levelId),
          },
        },
      });
      if (xp) {
        throw new Error("User already has xp for this level");
      }
      //get level point value
      const level = await ctx.prisma.level.findUnique({
        where: {
          id: Number(args.levelId),
        },
      });
      if (!level) {
        throw new Error("Level not found");
      }
      //add xp to user
      await ctx.prisma.user.update({
        where: {
          id: Number(user.id),
        },
        data: {
          totalXp: user.totalXp + level.point,
        },
      });
      //create xp
      const data = await ctx.prisma.xP.create({
        data: {
          userId: Number(user.id),
          levelId: Number(args.levelId),
        },
        ...query,
      });
      return data;
    },
  }),
);
builder.mutationField("useReferralCode", (t) =>
  t.prismaField({
    type: "User",
    args: {
      referralCode: t.arg({ type: "String", required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      // Check if the user is authenticated
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not Authenticated");
      }

      // Extract referral user ID from the code
      const referralUserId = args.referralCode.slice(-4);
      if (isNaN(Number(referralUserId))) {
        throw new Error("Invalid Referral code format.");
      }
      if (Number(referralUserId) === user.id) {
        throw new Error(
          "Invalid Referral code: You cannot use your own referral code.",
        );
      }

      // Fetch referred user
      const referredUser = await ctx.prisma.user.findUnique({
        where: { id: Number(referralUserId) },
      });

      if (!referredUser) {
        throw new Error("Invalid Referral code: User not found.");
      }

      // XP increment
      const xpIncrement = 10;

      // Update XP for the authenticated user
      await ctx.prisma.user.update({
        where: { id: Number(user.id) },
        data: { totalXp: user.totalXp + xpIncrement / 2 },
        ...query,
      });

      // Update XP for the referred user
      const updatedReferredUser = await ctx.prisma.user.update({
        where: { id: Number(referralUserId) },
        data: { totalXp: referredUser.totalXp + xpIncrement },
        ...query,
      });

      // Return referred user Data
      return updatedReferredUser;
    },
  }),
);
