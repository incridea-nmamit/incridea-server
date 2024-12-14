import { builder } from "~/graphql/builder";
import { checkIfAccommodationMember } from "~/graphql/models/UserInHotel/utils";

//Accommodation requests for Hotels
builder.queryField("accommodationRequests", (t) =>
  t.prismaField({
    type: ["UserInHotel"],
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) throw new Error("Not authenticated");
      if (!checkIfAccommodationMember(user.id))
        throw new Error("Not authorized");
      return await ctx.prisma.userInHotel.findMany({
        ...query,
      });
    },
  }),
);

//Accommodation requests by user
builder.queryField("accommodationRequestsByUser", (t) =>
  t.prismaField({
    type: ["UserInHotel"],
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) throw new Error("Not authenticated");
      return await ctx.prisma.userInHotel.findMany({
        where: {
          userId: user.id,
        },
        ...query,
      });
    },
  }),
);

builder.queryField("accommodationRequestsByUserId", (t) =>
  t.prismaField({
    type: ["UserInHotel"],
    args: {
      userId: t.arg({ type: "ID", required: true }),
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) throw new Error("Not authenticated");
      if (!checkIfAccommodationMember(user.id))
        throw new Error("Not authorized");
      const userId = Number(args.userId);
      return await ctx.prisma.userInHotel.findMany({
        where: {
          userId: userId,
        },
        ...query,
      });
    },
  }),
);

//Accommodation requests by Day
builder.queryField("accommodationRequestByDay", (t) =>
  t.prismaField({
    type: ["UserInHotel"],
    args: {
      date: t.arg({ type: "DateTime", required: true }),
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) throw new Error("Not authenticated");
      if (!checkIfAccommodationMember(user.id))
        throw new Error("Not authorized");
      const date = args.date;
      return await ctx.prisma.userInHotel.findMany({
        where: {
          checkIn: {
            equals: date,
          },
        },
        ...query,
      });
    },
  }),
);

//Accommodation requests by Hotel
builder.queryField("accommodationRequestByHotel", (t) =>
  t.prismaField({
    type: ["UserInHotel"],
    args: {
      name: t.arg({ type: "String", required: true }),
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) throw new Error("Not authenticated");
      if (!checkIfAccommodationMember(user.id))
        throw new Error("Not authorized");
      const hotelName = args.name;
      return await ctx.prisma.userInHotel.findMany({
        where: {
          Hotel: {
            OR: [
              {
                name: {
                  contains: hotelName,
                },
              },
              {
                details: {
                  contains: hotelName,
                },
              },
            ],
          },
        },
        ...query,
      });
    },
  }),
);

builder.queryField("getUserAccommodation", (t) =>
  t.prismaField({
    type: "UserInHotel",
    nullable: true,
    args: {},
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) throw new Error("Not authenticated");
      if (!checkIfAccommodationMember(user.id))
        throw new Error("Not authorized");
      return await ctx.prisma.userInHotel.findUnique({
        where: {
          userId: user.id,
        },
        ...query,
      });
    },
  }),
);
