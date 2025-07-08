"use server"

import { revalidatePath } from "next/cache"
import { notFound } from "next/navigation"
import { db } from "@/server/db"
import fs from "fs/promises"

export async function toggleProductAvailability(
  id: string,
  isAvailableForPurchase: boolean
) {
  await db.product.update({ where: { id }, data: { isAvailableForPurchase } })

  revalidatePath("/client/products")
  revalidatePath("/admin/products")
}

export async function deleteProduct(id: string) {
  try{
    const product = await db.product.delete({ where: { id } })

    if (product == null) return notFound()

    await fs.unlink(product.filePath).catch(() => {})
    await fs.unlink(`public${product.imagePath}`).catch(() => {})

    revalidatePath("/client/products")
    revalidatePath("/admin/products")
  } catch (err) {
    console.error("Failed to delete product:", err)
    throw new Error("Internal server error deleting product")
  }

  
}
