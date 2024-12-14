import jwt, { type JwtPayload } from "jsonwebtoken";
import { accessTokenZ, secrets } from "~/utils/auth/jwt";
import { prisma } from "~/utils/db";
import { type Response, type Request } from "express";

const authenticateUser = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
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
    });
  } catch (error) {
    console.log(error);
  }
};

export { authenticateUser };
