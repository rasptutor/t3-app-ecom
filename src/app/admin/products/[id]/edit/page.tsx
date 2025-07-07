// src/app/admin/products/[id]/edit/page.tsx

export const dynamic = "force-dynamic"; // <-- Important

import { PageHeader } from "@/app/admin/_components/PageHeader";
import { db } from "@/server/db";
import ProductForm from "../../_components/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await db.product.findUnique({
    where: { id: params.id },
  });

  if (!product) {
    return <p>Product not found.</p>;
  }

  return (
    <>
      <PageHeader>Edit Product</PageHeader>
      <ProductForm product={product} />
    </>
  );
}
