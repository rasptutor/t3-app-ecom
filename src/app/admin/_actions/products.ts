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
  const product = await db.product.delete({ where: { id } })

  if (product == null) return notFound()

  await fs.unlink(product.filePath)
  await fs.unlink(`public${product.imagePath}`)

  revalidatePath("/client/products")
  revalidatePath("/admin/products")
}
