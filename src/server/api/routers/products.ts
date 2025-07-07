// /server/api/routers/products.ts

import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure, adminProcedure } from "@/server/api/trpc";
import { v4 as uuid } from "uuid"

export const productRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.product.findMany({
      where: { 
        isAvailableForPurchase: true,
        deletedAt: null,
       },
      orderBy: { createdAt: "desc" },
    });
  }),

  getById: publicProcedure.input(z.string()).query(async ({ input, ctx }) => {
    return ctx.db.product.findFirst({
      where: {
        id: input,
        deletedAt: null,
      },
    });
  }),

  getBySlug: publicProcedure.input(z.string()).query(async ({ input, ctx }) => {
    return ctx.db.product.findFirst({
      where: {
        slug: input,
        deletedAt: null,
        isAvailableForPurchase: true,
      },
    });
  }),

  getAdminTable: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        priceInCents: true,
        filePath: true,
        imagePath: true,
        description: true,
        isAvailableForPurchase: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
  }),

  create: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().min(1),
      priceInCents: z.number().int().min(1),
      filePath: z.string(),  // path after upload
      imagePath: z.string(), // path after upload
    }))
    .mutation(async ({ input, ctx }) => {
      const baseSlug = input.name.toLowerCase().replace(/\s+/g, "-")
      let slug = `${baseSlug}-${uuid().slice(0, 6)}`

      const existing = await ctx.db.product.findUnique({ where: { slug } })
      if (existing) {
        slug = `${baseSlug}-${uuid().slice(0, 8)}`
      }

      const product = await ctx.db.product.create({
        data: {
          name: input.name,
          slug,
          description: input.description,
          priceInCents: input.priceInCents,
          filePath: input.filePath,
          imagePath: input.imagePath,
        },
      })

      return product
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        description: z.string().min(1),
        priceInCents: z.number().int().min(1),
        filePath: z.string(),
        imagePath: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const updated = await ctx.db.product.update({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description,
          priceInCents: input.priceInCents,
          filePath: input.filePath,
          imagePath: input.imagePath,
        },
      })

      return updated
    }),

  delete: adminProcedure
  .input(z.string())
  .mutation(async ({ input, ctx }) => {
    return ctx.db.product.update({
      where: { id: input },
      data: { deletedAt: new Date() },
    });
  }),

  toggleAvailability: adminProcedure
  .input(z.object({ id: z.string(), isAvailable: z.boolean() }))
  .mutation(async ({ input, ctx }) => {
    return ctx.db.product.update({
      where: { id: input.id },
      data: { isAvailableForPurchase: input.isAvailable },
    });
  }),

  download: adminProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const product = await ctx.db.product.findUniqueOrThrow({ where: { id: input } });

    return {
      filePath: product.filePath,
      name: product.name, // optional
    };
  }),

});
