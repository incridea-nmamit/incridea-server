import { createEnv } from "@t3-oss/env-core";
import * as dotenv from "dotenv";
import { z } from "zod";

// Load .env files during the build time
dotenv.config();

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    DATABASE_URL: z.string().url(),
    FRONTEND_URL: z.string().url(),
    AUTH_SECRET: z.string(),
    // This is a shared secret between the server and the client.
    // It's used to introspect graphql schema.
    SCHEMA_TOKEN: z.string(),
    PORT: z.coerce.number().default(4000),
    SMTP_HOST: z.string(),
    SMTP_PORT: z.coerce.number(),
    SMTP_FROM: z.string().email(),
    SMTP_EMAIL1: z.string().email(),
    SMTP_EMAIL2: z.string().email(),
    SMTP_EMAIL3: z.string().email(),
    SMTP_EMAIL4: z.string().email(),
    SMTP_EMAIL5: z.string().email(),
    SMTP_PASSWORD: z.string(),
    RAZORPAY_KEY: z.string(),
    RAZORPAY_SECRET: z.string(),
    RAZORPAY_WEBHOOK_SECRET: z.string(),
    UPLOADTHING_TOKEN: z.string(),
  },

  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix: "PUBLIC_",

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `PUBLIC_`.
   */
  client: {},

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnvStrict: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    FRONTEND_URL: process.env.FRONTEND_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    SCHEMA_TOKEN: process.env.SCHEMA_TOKEN,
    PORT: process.env.PORT,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_FROM: process.env.SMTP_FROM,
    SMTP_EMAIL1: process.env.SMTP_EMAIL1,
    SMTP_EMAIL2: process.env.SMTP_EMAIL2,
    SMTP_EMAIL3: process.env.SMTP_EMAIL3,
    SMTP_EMAIL4: process.env.SMTP_EMAIL4,
    SMTP_EMAIL5: process.env.SMTP_EMAIL5,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    RAZORPAY_KEY: process.env.RAZORPAY_KEY,
    RAZORPAY_SECRET: process.env.RAZORPAY_SECRET,
    RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
    UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
