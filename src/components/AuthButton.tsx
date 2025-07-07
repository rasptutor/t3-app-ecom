"use client";
import { signIn, signOut } from "next-auth/react";

export function AuthButton({ session }: { session: any }) {
  return (
    <button
      onClick={() => (session ? signOut() : signIn("discord"))}
      className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
    >
      {session ? "Sign out" : "Sign in"}
    </button>
  );
}