"use client"

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ComponentProps, type ReactNode } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

export function Nav({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  /*useEffect(() => {
    if (status === "loading") return; // Wait until session is loaded

    if (status === "unauthenticated" || session?.user?.role !== "ADMIN") {
      router.push("/"); // Redirect non-admins
    }
  }, [status, session, router]);*/

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/"); // only redirect if truly not signed in
    }
  }, [status, router]);

  const role = session?.user?.role;

  return (
    <nav 
    style={{
        backgroundColor: "oklch(0 0 0)",
        color: "oklch(1 0.04 265)"
    }} 
    className="bg-primary text-primary-foreground flex justify-around px-4"
    >
      <div className="flex space-x-4">{children}</div>
      <div className="flex items-center gap-6">
        {session?.user ? (
          <> 
            <span className="text-sm mr-4">
              {session.user.name || session.user.email}
            </span>           
            <button
              onClick={() => signOut()}
              className="text-sm hover:underline text-red-400"
            >
              Logout
            </button>
            
          </>
        ) : (
          <button
            onClick={() => signIn()}
            className="text-sm hover:underline text-blue-400"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  )
}

export function NavLink(props: Omit<ComponentProps<typeof Link>, "className"> & { href: string }) {
  const pathname = usePathname()
  const isActive = pathname === props.href;
  return (
    <Link
      {...props}
      className={cn(
        "p-4 hover:bg-gray-800 hover:text-white",
        isActive && "bg-white text-black"
      )}
      aria-current={isActive ? "page" : undefined}
    />
  )
}