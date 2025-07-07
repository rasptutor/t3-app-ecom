import { db } from "@/server/db"
import { notFound } from "next/navigation"
import CheckoutForm from "./_components/CheckoutForm"

export default async function PurchasePage({
  params: { id },
}: {
  params: { id: string }
}) {

    const product = await db.product.findUnique({ where: { id } })
    if (product == null) return notFound()

    return (
        <CheckoutForm product={product}/>
    )
}