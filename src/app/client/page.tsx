// /app/client/page.tsx

import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import {db} from "@/server/db"
import type { Product } from "@prisma/client";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cache } from "@/lib/cache";

const getMostPopularProducts = cache(
  async () =>
    db.product.findMany({
      where: { isAvailableForPurchase: true },
      orderBy: { orders: { _count: "desc" } },
      take: 6,
    }),
  ["home-most-popular-products"],
  { revalidate: 60 * 60 * 24 } // seconds
);

const getNewestProducts = cache(
  async () =>
    db.product.findMany({
      where: { isAvailableForPurchase: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ["home-newest-products"],
  { revalidate: 60 * 60 * 24 }
);

export default async function HomePage() {

    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "USER")) {
    redirect("/");
    }

    const [mostPopular, newest] = await Promise.all([
        getMostPopularProducts(),
        getNewestProducts(),
    ]);    
    
    return (
        <main className="space-y-12">
            <ProductGridSection
                title="Most Popular"
                products={mostPopular}
            />
            <ProductGridSection 
                title="Newest" 
                products={newest} 
            />
        </main>
    )
}

type ProductGridSectionProps = {
  title: string
  products: Product[];
}

function ProductGridSection({
  products,
  title,
}: ProductGridSectionProps) {
    return (
        <div className="space-y-4">
            <div className="flex gap-4">
                <h2 className="text-3xl font-bold">{title}</h2>
                <Button variant="outline" asChild>
                    <Link href="/client/products" className="space-x-2">
                        <span>View All</span>
                        <ArrowRight className="size-4" />
                    </Link>
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                    <ProductCard key={product.id} {...product} />
                ))}
            </div>
        </div>
    )
}
