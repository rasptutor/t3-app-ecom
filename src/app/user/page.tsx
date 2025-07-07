"use client";

import { api } from "@/trpc/react"; // '@/utils/api'
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminUserManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<"ADMIN" | "USER">("USER");

  useEffect(() => {    
    if (status === "loading") return; // wait for session
    if (session?.user.role !== "ADMIN") {
      router.replace("/"); // ⬅️ redirect to homepage
    }
  }, [session, status, router]);

  const { data: users, isLoading } = api.admin.getAllUsers.useQuery(undefined, {
    enabled: status === "authenticated" && session?.user.role === "ADMIN",
    });
  const utils = api.useUtils();

  const updateRole = api.admin.setUserRole.useMutation({
    onSuccess: (_data, variables) => {
      // If the currently logged in user demoted themselves, redirect
      if (variables.userId === session?.user.id && variables.role === "USER") {
        router.replace("/");
        return;
      }
      setSelectedUserId(null);
      utils.admin.getAllUsers.invalidate();
    },
  });

  if (!session || session.user.role !== "ADMIN") {    
    return <div className="p-4 text-red-500">Access denied. Admins only.</div>;
  }  

  return (
    <main className="p-4">
      <h1 className="mb-6 text-2xl font-bold">User Management</h1>

      {isLoading ? (
        <p>Loading users...</p>
      ) : (
        <table className="w-full border text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Role</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="p-2">{user.name || "(No name)"}</td>
                <td className="p-2">{user.email}</td>
                <td className="p-2">{user.role}</td>
                <td className="p-2">
                  {selectedUserId === user.id ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={newRole}
                        onChange={(e) =>
                          setNewRole(e.target.value as "ADMIN" | "USER")
                        }
                        className="border px-2 py-1"
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                      <button
                        onClick={() =>
                          updateRole.mutate({
                            userId: user.id,
                            role: newRole,
                          })
                        }
                        className="rounded bg-green-600 px-2 py-1 text-white hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setSelectedUserId(null)}
                        className="rounded bg-gray-400 px-2 py-1 text-white hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setNewRole(user.role);
                      }}
                      className="rounded bg-blue-600 px-2 py-1 text-white hover:bg-blue-700"
                    >
                      Change Role
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}