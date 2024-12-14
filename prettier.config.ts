import { type PluginConfig } from "@trivago/prettier-plugin-sort-imports";
import { type Config } from "prettier";

const importConfig: PluginConfig = {
  importOrder: [
    "^@core/(.*)$",
    "^@server/(.*)$",
    "^@ui/(.*)$",
    "~/server/(.*)$",
    "~/pages/(.*)$",
    "~/components/ui/(.*)$",
    "~/(.*)",
    "^[./]",
  ],
  importOrderCaseInsensitive: true,
  importOrderGroupNamespaceSpecifiers: true,
  // importOrderParserPlugins: [],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};

const config: Config = {
  tabWidth: 2,
  useTabs: false,
  ...importConfig,
  plugins: ["@trivago/prettier-plugin-sort-imports"],
};

export default config;
