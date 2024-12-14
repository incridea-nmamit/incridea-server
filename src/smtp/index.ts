import { createTransport, type SendMailOptions } from "nodemailer";

import { env } from "~/env";
import { prisma } from "~/utils/db";

const sendEmail = async (
  mailOptions: SendMailOptions & {
    from?: never;
  },
) => {
  const count = (await prisma.emailMonitor.findFirst())?.count ?? 0;
  const email = [
    env.SMTP_EMAIL1,
    env.SMTP_EMAIL2,
    env.SMTP_EMAIL3,
    env.SMTP_EMAIL4,
    env.SMTP_EMAIL5,
  ][count % 5]!;

  const transport = createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: email,
      pass: env.SMTP_PASSWORD,
    },
  });

  const info = await transport.sendMail({
    from: env.SMTP_FROM,
    ...mailOptions,
  });

  await prisma.emailMonitor.update({
    where: { id: 1 },
    data: {
      count: {
        increment: 1,
      },
    },
  });

  const failed = info.rejected.concat(info.pending).filter(Boolean);

  if (failed.length > 0)
    throw new Error(
      `Email(s) (${failed.map((m) => (typeof m == "string" ? m : m.address)).join(", ")}) could not be sent`,
    );
};

export { sendEmail };
