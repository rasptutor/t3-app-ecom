import Link from "next/link";

import { auth } from "@/server/auth";
import { HydrateClient } from "@/trpc/server";
import { db } from "@/server/db";
import { redirect } from "next/navigation";
import { AuthButton } from "@/components/AuthButton";

export default async function Home() {  
  
  const session = await auth();
  
  if (session?.user.role === 'ADMIN') {          
    redirect('/admin')
  } else {
    //redirect('/client')
  }  

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Create <span className="text-[hsl(280,100%,70%)]">T3</span> App
          </h1>          
          <div className="flex flex-col items-center gap-2">
            
            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-center text-2xl text-white">
                {/*session && <span>Logged in as {session.user?.name} as {session.user?.role}</span>*/}
              </p>
              <AuthButton session={session}/>              
              
            </div>
          </div>          
        </div>
      </main>
    </HydrateClient>
  );
}
