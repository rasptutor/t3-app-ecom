import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { UserRole } from "@prisma/client";

export const adminRouter = createTRPCRouter({
  getAllUsers: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user || ctx.session.user.role !== "ADMIN") {
        console.log("Access denied:", ctx.session?.user);
        throw new Error("Not authorized");
    }

    return ctx.db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  }),

  setUserRole: protectedProcedure
    .input(z.object({
      userId: z.string(),
      role: z.nativeEnum(UserRole),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user || ctx.session.user.role !== "ADMIN") {
        throw new Error("Not authorized");
      }

      return ctx.db.user.update({
        where: { id: input.userId },
        data: { role: input.role },
        select: { id: true, role: true },
      });
    }),
});
