import { createRouteHandler } from "uploadthing/express";
import { env } from "~/env";
import { uploadRouter } from "~/uploadthing/router";

const uploadThingHandler = createRouteHandler({
  router: uploadRouter,
  config: {
    token: env.UPLOADTHING_TOKEN,
  },
});

export { uploadThingHandler };
