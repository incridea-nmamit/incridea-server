/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { type Request, type Response } from "express";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils";

import { env } from "~/env";
import { prisma } from "~/utils/db";

export async function handler(req: Request, res: Response) {
  if (req.method !== "POST") {
    res.status(405).send({ message: "Only POST requests allowed" });
    return;
  }

  const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET;
  const webhookSignature = req.headers["x-razorpay-signature"] as string;
  if (
    !validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      webhookSecret,
    )
  ) {
    res.status(400).send({ message: "Invalid request" });
    return;
  }

  try {
    const order_id = req.body?.payload?.payment?.entity?.order_id as string;
    const status = req.body?.payload?.payment?.entity?.status as string;
    if (!order_id || !status) {
      res.status(400).send({ message: "Invalid request" });
      return;
    }

    if (status === "captured") {
      // find payment order from two tables
      const paymentOrder = await prisma.paymentOrder.findUnique({
        where: {
          orderId: order_id,
        },
      });

      if (paymentOrder) {
        const updatedPaymentOrder = await prisma.paymentOrder.update({
          where: {
            orderId: order_id,
          },
          data: {
            status: "SUCCESS",
            paymentData: req.body.payload.payment.entity.paymentData,
          },
        });
        await prisma.user.update({
          where: {
            id: paymentOrder.userId,
          },
          data: {
            role: "PARTICIPANT",
          },
        });

        res.status(200).json(updatedPaymentOrder);
        return;
      } else {
        const updatedPaymentOrder = await prisma.eventPaymentOrder.update({
          where: {
            orderId: order_id,
          },
          data: {
            status: "SUCCESS",
            paymentData: req.body.payload.payment.entity.paymentData,
          },
        });
        await prisma.team.update({
          where: {
            id: updatedPaymentOrder.teamId,
          },
          data: {
            confirmed: true,
          },
        });
        res.status(200).json(updatedPaymentOrder);
        return;
      }
    } else {
      await prisma.paymentOrder.update({
        where: {
          orderId: order_id,
        },
        data: {
          status: "FAILED",
          paymentData: req.body.payload.payment.entity.paymentData,
        },
      });
    }
  } catch (err) {
    res.status(400).json(err);
    return;
  }
}
