import { createYoga } from "graphql-yoga";
import { yogaContext } from "~/graphql/context";
import { pothosSchema } from "~/graphql/schema";
import { yogaPlugins } from "~/graphql/plugins";

const yoga = createYoga({
  context: yogaContext,
  schema: pothosSchema,
  plugins: yogaPlugins,
});

export { yoga };
