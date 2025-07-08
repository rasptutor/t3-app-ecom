// app/admin/products/_components/EditProductLink.tsx
import Link from "next/link"

export function EditProductLink({ id }: { id: string }) {
  return (
    <Link href={`/admin/products/${id}/edit`} prefetch={false}>
      Edit
    </Link>
  )
}