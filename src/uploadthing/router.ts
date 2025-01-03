/* eslint-disable @typescript-eslint/only-throw-error */
import { createUploadthing, type FileRouter } from "uploadthing/express";
import { authenticateUser } from "~/uploadthing/authenticateUser";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const uploadRouter = {
  eventUploader: f({
    image: {
      maxFileCount: 1,
      maxFileSize: "4MB",
    },
  })
    .middleware(async ({ req, res }) => {
      const user = await authenticateUser(req, res);
      if (!user)
        throw new UploadThingError({
          message: "Unauthorized",
          code: "FORBIDDEN",
        });
      return { userId: user.id };
    })
    .onUploadComplete((data) => {
      console.log("event Image:", data.file.url);
    }),

  easterEggUploader: f({
    image: {
      maxFileCount: 1,
      maxFileSize: "4MB",
    },
  })
    //check
    .middleware(async ({ req, res }) => {
      const user = await authenticateUser(req, res);
      if (!user)
        throw new UploadThingError({
          message: "Unauthorized",
          code: "FORBIDDEN",
        });
      return { userId: user.id };
    })
    .onUploadComplete((data) => {
      console.log("easter Egg :", data.file.url);
    }),

  quizQuestionImgUploader: f({
    image: {
      maxFileCount: 1,
      maxFileSize: "4MB",
    },
  })
    .middleware(async ({ req, res }) => {
      const user = await authenticateUser(req, res);
      if (!user)
        throw new UploadThingError({
          message: "Unauthorized",
          code: "FORBIDDEN",
        });
      return { userId: user.id };
    })
    .onUploadComplete((data) => {
      console.log("Question Image :", data.file.url);
    }),

  idUploader: f({
    image: {
      maxFileCount: 1,
      maxFileSize: "4MB",
    },
  })
    .middleware(async ({ req, res }) => {
      const user = await authenticateUser(req, res);
      if (!user)
        throw new UploadThingError({
          message: "Unauthorized",
          code: "FORBIDDEN",
        });
      return { userId: user.id };
    })
    .onUploadComplete((data) => {
      console.log("id uploaded", data.file.url);
    }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
