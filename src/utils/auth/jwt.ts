import { env } from "~/env";
import jwt from "jsonwebtoken";
import { z } from "zod";

const AUTH_SECRET = env.AUTH_SECRET;

export const secrets = {
  JWT_ACCESS_SECRET: AUTH_SECRET + "access",
  JWT_REFRESH_SECRET: AUTH_SECRET + "refresh",
  JWT_VERIFICATION_SECRET: AUTH_SECRET + "verification",
  JWT_PASSWORD_RESET_SECRET: AUTH_SECRET + "password-reset",
} as const;

export const accessTokenZ = z.object({
  userId: z.number(),
});
export type AccessToken = z.infer<typeof accessTokenZ>;
const generateAccessToken = (user: { id: number }) =>
  jwt.sign(
    {
      userId: user.id,
    } satisfies AccessToken,
    secrets.JWT_ACCESS_SECRET,
    {
      expiresIn: "1d",
    },
  );

export const refreshTokenZ = z.object({
  userId: z.number(),
  jti: z.string(),
});
export type RefreshToken = z.infer<typeof refreshTokenZ>;
const generateRefreshToken = (user: { id: number }, jti: string) =>
  jwt.sign(
    {
      userId: user.id,
      jti,
    } satisfies RefreshToken,
    secrets.JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
    },
  );

export const generateTokens = (user: { id: number }, jti: string) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user, jti);

  return {
    accessToken,
    refreshToken,
  };
};

export const verificationTokenZ = z.object({
  userId: z.number(),
  jti: z.string(),
});
export type VerificationToken = z.infer<typeof verificationTokenZ>;
export const generateVerificationToken = (user: { id: number }, jti: string) =>
  jwt.sign(
    {
      userId: user.id,
      jti,
    } satisfies VerificationToken,
    secrets.JWT_VERIFICATION_SECRET,
    {
      expiresIn: "1d",
    },
  );

export const passwordResetTokenZ = z.object({
  userId: z.number(),
  jti: z.string(),
});
export type PasswordResetToken = z.infer<typeof passwordResetTokenZ>;
export const generatePasswordResetToken = (user: { id: number }, jti: string) =>
  jwt.sign(
    {
      userId: user.id,
      jti,
    } satisfies PasswordResetToken,
    secrets.JWT_PASSWORD_RESET_SECRET,
    {
      expiresIn: "1d",
    },
  );
