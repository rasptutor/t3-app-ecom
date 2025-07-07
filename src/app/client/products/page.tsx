// /app/client/products/page.tsx

import { ProductCard } from "@/components/ProductCard";
import { cache } from "@/lib/cache";
import { db } from "@/server/db"

const getTopProducts = cache(
  async () =>
    db.product.findMany({
      where: { isAvailableForPurchase: true },
      orderBy: { orders: { _count: "desc" } },
      take: 6,
    }),
  ["top-products"],
  { revalidate: 60 } // Revalidates every 60 seconds
)

export default async function ProductsPage() { 
    
    const products = await getTopProducts()

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
                <ProductCard key={product.id} {...product} />
            ))}
        </div>
    )
}
