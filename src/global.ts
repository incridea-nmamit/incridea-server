import url from "url";

const getSrcDir = () => url.fileURLToPath(new URL(".", import.meta.url));

export { getSrcDir };
