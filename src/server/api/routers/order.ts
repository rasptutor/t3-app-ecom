import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";

export const orderRouter = createTRPCRouter({
  getAllForUser: protectedProcedure.query(async ({ ctx }) => {
    return await db.order.findMany({
      where: { userId: ctx.session.user.id },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const product = await db.product.findUnique({
        where: { id: input.productId },
      });

      if (!product || !product.isAvailableForPurchase) {
        throw new Error("Product not available.");
      }

      return await db.order.create({
        data: {
          userId: ctx.session.user.id,
          productId: product.id,
          pricePaidInCents: product.priceInCents,
        },
      });
    }),
});

