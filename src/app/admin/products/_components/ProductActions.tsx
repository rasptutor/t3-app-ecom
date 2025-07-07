"use client"

// /admin/products/_components/ProductActions.tsx

import { deleteProduct, toggleProductAvailability } from "@/app/admin/_actions/products"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { api } from "@/trpc/react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

export function ActiveToggleDropdownItem({
  id,
  isAvailable,
}: {
  id: string
  isAvailable: boolean
}) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()
    const utils = api.useUtils()    
    return (
        <DropdownMenuItem
            disabled={isPending}
            onClick={() => {
                startTransition(async () => {
                await toggleProductAvailability(id, !isAvailable)
                await utils.product.getAdminTable.invalidate()
                router.refresh()
                })
            }}
            >
            {isAvailable ? "Deactivate" : "Activate"}
        </DropdownMenuItem>
    )
}

export function DeleteDropdownItem({ id, disabled }: { id: string, disabled: boolean}) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()
    const utils = api.useUtils()
    return (
        <DropdownMenuItem
            className="bg-red-600 text-white"
            disabled={disabled || isPending}
            onClick={() => {
                if (disabled) return;
                if (window.confirm("Are you sure you want to delete this product?")) {
                    startTransition(async () => {
                    await deleteProduct(id)
                    await utils.product.getAdminTable.invalidate()
                    router.refresh()
                    })
                }                
            }}
        >
        Delete
        </DropdownMenuItem>
    )
}


