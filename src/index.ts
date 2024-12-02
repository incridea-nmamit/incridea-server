import { useDepthLimit } from "@envelop/depth-limit";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { createYoga } from "graphql-yoga";
import { createRouteHandler } from "uploadthing/express";
import { context } from "~/context";
import { env } from "~/env";
import { schema } from "~/schema";
import { handler as razorpayCapture } from "~/webhook/capture";
import { uploadRouter } from "./uploadthing/FileRouter";

const yoga = createYoga({
  context,
  schema,
  plugins: [useDepthLimit({ maxDepth: 7 })], //max depth allowed to avoid infinite nested queries
});

const app = express();
app.use(
  cors({
    origin: env.FRONTEND_URL,
  }),
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.send("Hello Incridea");
});

app.use("/graphql", yoga.requestListener);
app.post("/webhook/capture", razorpayCapture);
app.use(
  "/uploadthing",
  createRouteHandler({
    router: uploadRouter,
    config: { token: env.UPLOADTHING_SECRET },
  }),
);

app.listen(env.PORT, () => {
  console.log(`🚀 Server ready at: http://localhost:4000/graphql`);
});
