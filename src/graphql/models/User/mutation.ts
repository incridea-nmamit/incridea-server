import bcrypt from "bcryptjs";
import fs from "fs";
import jwt, { type JwtPayload } from "jsonwebtoken";
import path from "path";
import { v4 as uuidv4 } from "uuid";

import { builder } from "~/graphql/builder";
import { avatarList } from "~/constants";
import { env } from "~/env";
import { getSrcDir } from "~/global";
import {
  addVerificationTokenToWhitelist,
  addRefreshTokenToWhitelist,
  revokeRefreshToken,
  findRefreshTokenById,
  findVerificationTokenByID,
  revokeVerificationToken,
  addPasswordResetTokenToWhitelist,
  revokePasswordResetToken,
  findPasswordResetTokenByID,
  revokeAllRefreshTokens,
} from "~/services/auth.service";
import {
  findUserByEmail,
  createUserByEmailAndPassword,
  findUserById,
} from "~/services/user.services";
import { hashToken } from "~/utils/auth/hashToken";
import {
  generatePasswordResetToken,
  generateTokens,
  generateVerificationToken,
  secrets,
} from "~/utils/auth/jwt";
import { sendEmail } from "~/smtp";

const verifyEmail = fs.readFileSync(
  path.join(getSrcDir(), "/templates/verifyEmail.html"),
  "utf8",
);

const forgotPassword = fs.readFileSync(
  path.join(getSrcDir(), "/templates/forgotPassword.html"),
  "utf8",
);

// register user
const UserCreateInput = builder.inputType("UserCreateInput", {
  fields: (t) => ({
    name: t.string({ required: true }),
    email: t.string({ required: true }),
    password: t.string({ required: true }),
    phoneNumber: t.string({ required: true }),
    collegeId: t.int({ required: true }),
    profileImage: t.string({ required: true }),
  }),
});

builder.mutationField("signUp", (t) =>
  t.prismaField({
    type: "User",
    args: {
      data: t.arg({
        type: UserCreateInput,
        required: true,
      }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      // if user already exists throw error
      const existingUser = await findUserByEmail(args.data.email);
      if (existingUser && !existingUser.isVerified)
        throw new Error("Please verify your email and Login");

      if (existingUser) throw new Error("User already exists please login");

      args.data.profileImage =
        avatarList[Math.floor(Math.random() * (avatarList.length - 1))]!.url;
      const user = await createUserByEmailAndPassword(args.data);
      return user;
    },
  }),
);

// User Login
const UserLoginInput = builder.inputType("UserLoginInput", {
  fields: (t) => ({
    email: t.string({ required: true }),
    password: t.string({ required: true }),
  }),
});

class Token {
  accessToken: string;
  refreshToken: string;

  constructor(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
}

const UserLoginPayload = builder.objectType(Token, {
  name: "UserLoginPayload",
  fields: (t) => ({
    accessToken: t.exposeString("accessToken"),
    refreshToken: t.exposeString("refreshToken"),
  }),
});

builder.mutationField("login", (t) =>
  t.field({
    type: UserLoginPayload,
    errors: {
      types: [Error],
    },
    args: {
      data: t.arg({
        type: UserLoginInput,
        required: true,
      }),
    },
    resolve: async (root, args, ctx) => {
      const existingUser = await findUserByEmail(args.data.email);
      if (!existingUser) {
        throw new Error("No user found");
      }
      const validPassword = await bcrypt.compare(
        args.data.password,
        existingUser.password,
      );
      if (!validPassword) {
        throw new Error("Invalid password");
      }
      if (!existingUser.isVerified) {
        throw new Error("Please verify your email");
      }

      const jti = uuidv4();
      //give new refresh token
      const { accessToken, refreshToken } = generateTokens(existingUser, jti);
      await addRefreshTokenToWhitelist({
        jti,
        refreshToken,
        userId: existingUser.id,
      });

      return {
        accessToken,
        refreshToken,
      };
    },
  }),
);

// refresh token
builder.mutationField("refreshToken", (t) =>
  t.field({
    description: "Refreshes the access token",
    type: UserLoginPayload,
    errors: {
      types: [Error],
    },
    args: {
      refreshToken: t.arg({
        type: "String",
        required: true,
      }),
    },
    resolve: async (root, args, ctx) => {
      const payload = jwt.verify(
        args.refreshToken,
        secrets.JWT_REFRESH_SECRET,
      ) as JwtPayload;
      if (!payload.jti) throw new Error("Unauthorized");

      const savedRefreshToken = await findRefreshTokenById(payload.jti);
      if (!savedRefreshToken || savedRefreshToken.revoked)
        throw new Error("Unauthorized");

      const hashedToken = hashToken(args.refreshToken);
      if (hashedToken !== savedRefreshToken.hashedToken) {
        throw new Error("Unauthorized");
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const user = await findUserById(payload.userId);
      if (!user) {
        throw new Error("Unauthorized");
      }
      await revokeRefreshToken(savedRefreshToken.id);
      const jti = uuidv4();
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(
        user,
        jti,
      );
      await addRefreshTokenToWhitelist({
        jti,
        refreshToken: newRefreshToken,
        userId: user.id,
      });

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    },
  }),
);

builder.mutationField("sendEmailVerification", (t) =>
  t.field({
    type: "String",
    errors: {
      types: [Error],
    },
    args: {
      email: t.arg({
        type: "String",
        required: true,
      }),
    },
    resolve: async (root, args, ctx) => {
      const existingUser = await findUserByEmail(args.email);
      if (!existingUser) throw new Error("No user found");
      if (existingUser.isVerified) throw new Error("User already verified");

      const { id: token } = await addVerificationTokenToWhitelist({
        userId: existingUser.id,
      });

      const verificationToken = generateVerificationToken(existingUser, token);

      const url = `${env.FRONTEND_URL}/auth/verify-email?token=${verificationToken}`;

      const content = verifyEmail
        .replace("{{name}}", existingUser.name)
        .replace("{{link}}", url);

      await sendEmail({
        to: existingUser.email,
        subject: "Incridea Email Verification",
        html: content,
      });

      return "Email sent";
    },
  }),
);

builder.mutationField("verifyEmail", (t) =>
  t.prismaField({
    type: "User",

    errors: {
      types: [Error],
    },
    args: {
      token: t.arg.string({ required: true }),
    },
    resolve: async (query, root, args, ctx, info) => {
      const payload = jwt.verify(
        args.token,
        secrets.JWT_VERIFICATION_SECRET,
      ) as JwtPayload;
      if (!payload.jti) throw new Error("Invalid token");
      const savedToken = await findVerificationTokenByID(payload.jti);
      if (!savedToken || savedToken.revoked === true)
        throw new Error("Invalid token");
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const user = await findUserById(payload.userId);
      if (!user) {
        throw new Error("Invalid token");
      }
      const verified_user = await ctx.prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });
      await revokeVerificationToken(savedToken.id);

      return verified_user;
    },
  }),
);

// send password reset email
builder.mutationField("sendPasswordResetEmail", (t) =>
  t.field({
    type: "String",
    errors: {
      types: [Error],
    },
    args: {
      email: t.arg({
        type: "String",
        required: true,
      }),
    },
    resolve: async (root, args, ctx) => {
      const existingUser = await findUserByEmail(args.email);
      if (!existingUser)
        throw new Error("You do not have an account here. Please sign up");

      const { id: token } = await addPasswordResetTokenToWhitelist({
        userId: existingUser.id,
      });

      const passwordResetToken = generatePasswordResetToken(
        existingUser,
        token,
      );

      const url = `${env.FRONTEND_URL}/auth/reset-password?token=${passwordResetToken}`;

      const content = forgotPassword
        .replace("{{name}}", existingUser.name)
        .replace("{{link}}", url);

      await sendEmail({
        to: existingUser.email,
        html: content,
        subject: "Incridea Reset Password",
      });

      return "Email sent";
    },
  }),
);

// reset password
builder.mutationField("resetPassword", (t) =>
  t.prismaField({
    type: "User",
    errors: {
      types: [Error],
    },
    args: {
      token: t.arg.string({ required: true }),
      password: t.arg.string({ required: true }),
    },
    resolve: async (query, root, args, ctx, info) => {
      const payload = jwt.verify(
        args.token,
        secrets.JWT_PASSWORD_RESET_SECRET,
      ) as JwtPayload;
      if (!payload.jti) throw new Error("Invalid token");
      const savedToken = await findPasswordResetTokenByID(payload.jti);
      if (!savedToken || savedToken.revoked === true)
        throw new Error("Invalid token");

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const user = await findUserById(payload.userId);
      if (!user) throw new Error("Invalid token");

      const hashedPassword = await bcrypt.hash(args.password, 12);
      const updated_user = await ctx.prisma.user.update({
        ...query,
        where: { id: user.id },
        data: { password: hashedPassword },
      });
      await revokePasswordResetToken(savedToken.id);

      // revoke any refresh tokens, signing out user from all devices
      await revokeAllRefreshTokens(user.id);

      return updated_user;
    },
  }),
);

builder.mutationField("updateProfileImage", (t) =>
  t.prismaField({
    type: "User",
    errors: {
      types: [Error],
    },
    args: {
      imageURL: t.arg.string({ required: true }),
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }
      return await ctx.prisma.user.update({
        where: { id: user.id },
        data: { profileImage: args.imageURL },
      });
    },
  }),
);
