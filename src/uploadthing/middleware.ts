import jwt, { JwtPayload } from "jsonwebtoken";
import { secrets } from "~/utils/auth/jwt";
import { prisma } from "~/utils/db/prisma";
import express from "express";

class UnauthorizedError extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
    this.statusCode = 401;
  }
}

const authMiddleware = async (req: express.Request) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    throw new UnauthorizedError("Unauthorized: No token provided");
  }

  try {
    const tokenPayload = jwt.verify(
      token,
      secrets.JWT_ACCESS_SECRET as string,
    ) as JwtPayload;

    if (tokenPayload.userId) {
      const user = await prisma.user.findUnique({
        where: { id: tokenPayload.userId },
      });

      if (!user) {
        throw new UnauthorizedError("Unauthorized: User not found");
      }

      return user.id;
    }

    throw new UnauthorizedError("Unauthorized: Invalid token payload");
  } catch (e) {
    if (e instanceof UnauthorizedError) {
      throw e;
    }

    console.error("Token verification error:", e);
    throw new UnauthorizedError("Unauthorized: Invalid token");
  }
};

export default authMiddleware;
