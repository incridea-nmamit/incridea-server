import crypto from "crypto";

const hashToken = (token: string) =>
  crypto.createHash("sha512").update(token).digest("hex");

export { hashToken };
