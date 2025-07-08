// src/app/admin/products/[id]/edit/page.tsx

export const dynamic = "force-dynamic"; // <-- Important

import { PageHeader } from "@/app/admin/_components/PageHeader";
import { db } from "@/server/db";
import ProductForm from "../../_components/ProductForm";

type Props = {
  params: { id: string };
};

export default async function EditProductPage({ params }: Props) {
  const { id } = params; // ✅ this is fine if `params` comes from an async function

  const product = await db.product.findUnique({ where: { id } });

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
