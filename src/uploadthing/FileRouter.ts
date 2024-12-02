import { createUploadthing, type FileRouter } from "uploadthing/express";
import authMiddleware from "./middleware";
const f = createUploadthing();

export const uploadRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  eventUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const userDetail = await authMiddleware(req);
      return { userId: userDetail };
    })
    .onUploadComplete(async (data) => {
      console.log("event Image:", data.file.url);
    }),

  easterEggUploader: f({
    image: {
      maxFileCount: 1,
      maxFileSize: "4MB",
    },
  })
    .middleware(async ({ req }) => {
      const userDetail = await authMiddleware(req);
      return { userId: userDetail };
    })
    .onUploadComplete((data) => {
      console.log("easter Egg :", data.file.url);
    }),

  idUploader: f({
    image: {
      maxFileCount: 1,
      maxFileSize: "4MB",
    },
  })
    .middleware(async ({ req }) => {
      const userDetail = await authMiddleware(req);
      return { userId: userDetail };
    })
    .onUploadComplete((data) => {
      console.log("id uploaded", data.file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
