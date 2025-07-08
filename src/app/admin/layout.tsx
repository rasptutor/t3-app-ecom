// /admin/layout.tsx

import { Nav, NavLink } from "@/components/Nav"
import { requireAdmin } from "@/lib/auth-guards";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await requireAdmin(); 
  return (
    <>
      <Nav>
        <NavLink href="/admin">Dashboard</NavLink>
        <NavLink href="/admin/products">Products</NavLink>
        <NavLink href="/admin/users">Customers</NavLink>
        <NavLink href="/admin/orders">Sales</NavLink>
      </Nav>
      <main className="container my-6">{children}</main>
    </>
  )
}