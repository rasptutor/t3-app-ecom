import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

import { db } from "@/server/db";
import {UserRole} from '@prisma/client'

import type { Adapter } from "@auth/core/adapters";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
       //role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
  //   // ...other properties
     //role: UserRole;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    DiscordProvider({
    clientId: process.env.AUTH_DISCORD_ID!,
    clientSecret: process.env.AUTH_DISCORD_SECRET!
  }),
  
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  adapter: PrismaAdapter(db) as Adapter,
  callbacks: {
    async signIn({ user }) {
      // If user has no role yet, assign one via Prisma
      const dbUser = await db.user.findUnique({ where: { id: user.id } });

      if (dbUser && !dbUser.role) {
        await db.user.update({
          where: { id: user.id },
          data: { role: "USER" }, // or "ADMIN" if needed
        });
      }

      return true;
    },
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
        role: user.role as UserRole,
      },
    }),
  },
} satisfies NextAuthConfig;

