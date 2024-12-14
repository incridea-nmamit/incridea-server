import { blockFieldSuggestionsPlugin } from "@escape.tech/graphql-armor-block-field-suggestions";
import { costLimitPlugin } from "@escape.tech/graphql-armor-cost-limit";
import { maxAliasesPlugin } from "@escape.tech/graphql-armor-max-aliases";
import { maxDepthPlugin } from "@escape.tech/graphql-armor-max-depth";
import { maxDirectivesPlugin } from "@escape.tech/graphql-armor-max-directives";
import { maxTokensPlugin } from "@escape.tech/graphql-armor-max-tokens";
import { useDisableIntrospection } from "@graphql-yoga/plugin-disable-introspection";
import { type Plugin } from "graphql-yoga";
import { env } from "~/env";

const basePlugins: (Plugin | object)[] = [
  maxDepthPlugin({
    n: 10,
    flattenFragments: true,
  }),
  maxAliasesPlugin({
    n: 5,
  }),
  maxDirectivesPlugin({
    n: 5,
  }),
  maxTokensPlugin({
    n: 250,
  }),
  costLimitPlugin({
    maxCost: 1000,
  }),
];

const productionPlugins: (Plugin | object)[] = [
  useDisableIntrospection({
    isDisabled: (request) => {
      const authHeader = request.headers.get("Authorization");
      const token = authHeader?.replace("Bearer ", "");
      return token !== env.SCHEMA_TOKEN;
    },
  }),
  blockFieldSuggestionsPlugin(),
];

const yogaPlugins = [
  ...basePlugins,
  ...(env.NODE_ENV === "production" ? productionPlugins : []),
];

export { yogaPlugins };
