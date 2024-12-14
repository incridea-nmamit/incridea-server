import { type YogaInitialContext } from "@graphql-yoga/node";
import { type PrismaClient } from "@prisma/client";
import jwt, { type JwtPayload } from "jsonwebtoken";

import { accessTokenZ, secrets } from "~/utils/auth/jwt";

const authenticateUser = async (
  prisma: PrismaClient,
  request: YogaInitialContext["request"],
) => {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;

  const token = authHeader.replace("Bearer ", "");
  if (!token) return null;

  try {
    const payload = jwt.verify(token, secrets.JWT_ACCESS_SECRET) as JwtPayload;

    const { success, data: typedPayload } = accessTokenZ.safeParse(payload);
    if (!success) return null;

    return await prisma.user.findUnique({
      where: {
        id: typedPayload.userId,
      },
      include: { College: true },
    });
  } catch (error) {
    console.log(error);
  }
};

export { authenticateUser };
