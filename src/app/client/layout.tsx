import { Nav, NavLink } from "@/components/Nav"

export const dynamic = "force-dynamic"

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <Nav>
        <NavLink href="/client">Home</NavLink>
        <NavLink href="/client/products">Products</NavLink>
        <NavLink href="/client/orders">My Orders</NavLink>
      </Nav>
      <div className="container my-6">{children}</div>
    </>
  )
}