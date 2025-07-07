"use client"
// /admin/products/page.tsx
import { Button } from "@/components/ui/button";
import { PageHeader } from "../_components/PageHeader";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/trpc/react";
import AdminLoading from "../loading";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { CheckCircle2, MoreVertical, XCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ActiveToggleDropdownItem, DeleteDropdownItem } from "./_components/ProductActions";

export default function AdminProductsPage() {
  return (
    <>
      <div className="flex justify-between items-center gap-4 m-8">
        <PageHeader>Products</PageHeader>
        <Button asChild>
            <Link href="/admin/products/new">Add Product</Link>
        </Button>
      </div>
      <ProductsTable />      
    </>
  )
}

type ProductWithOrderCount = {
  id: string;
  name: string;
  slug: string;
  priceInCents: number;
  filePath: string;
  imagePath: string;
  description: string;
  isAvailableForPurchase: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  _count: {
    orders: number;
  };
};

function ProductsTable() {
  const { data: products, isPending } = api.product.getAdminTable.useQuery<ProductWithOrderCount[]>();  

  if (isPending) return <AdminLoading/>

  if (!isPending && products?.length === 0) {
    return (
      <div className="text-center text-muted-foreground my-10">
        No products found.
      </div>
    );
  }

  return (
      <Table>
          <TableHeader>
              <TableRow>
                  <TableHead className="w-0">
                      <span className="">Available For Purchase</span>
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead className="w-0">
                      <span className="">Actions</span>
                  </TableHead>
              </TableRow>
          </TableHeader>
          <TableBody>
            {products?.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  {product.isAvailableForPurchase ? (
                    <>
                      <span className="sr-only">Available</span>
                      <CheckCircle2 />
                    </>
                  ) : (
                    <>
                      <span className="sr-only">Unavailable</span>
                      <XCircle className="stroke-destructive" />
                    </>
                  )}
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{formatCurrency(product.priceInCents / 100)}</TableCell>
                <TableCell>{formatNumber(product._count.orders)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="p-2 rounded hover:bg-muted focus:outline-none focus:ring"
                        aria-label="Open actions menu"
                      >
                        <MoreVertical />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem asChild>
                        <a download href={`/admin/products/${product.id}/download`}>
                          Download
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/products/${product.id}/edit`}>
                          Edit
                        </Link>
                      </DropdownMenuItem>
                        <ActiveToggleDropdownItem
                          id={product.id}
                          isAvailable={product.isAvailableForPurchase}
                        />
                        <DropdownMenuSeparator />
                        <DeleteDropdownItem
                          id={product.id}
                          disabled={product._count.orders > 0}
                        />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
      </Table>
  )
}