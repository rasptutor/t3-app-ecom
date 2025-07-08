export const dynamic = "force-dynamic"; 

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth-guards";
import { formatCurrency } from "@/lib/formatters";

import { db } from "@/server/db";

async function getSalesData() {
  const totalOrders = await db.order.count();
  const totalRevenue = await db.order.aggregate({
    _sum: { pricePaidInCents: true },
  });

  return {
    orderCount: totalOrders,
    totalRevenue: (totalRevenue._sum.pricePaidInCents ?? 0) / 100,
  };
}

async function getUserData() {
  const userCount = await db.user.count();

  const avgOrderValue = await db.order.aggregate({
    _avg: { pricePaidInCents: true },
  });

  return {
    userCount,
    averageOrderValue: (avgOrderValue._avg.pricePaidInCents ?? 0) / 100,
  };
}

async function getProductData() {
  const activeProducts = await db.product.count({
    where: { isAvailableForPurchase: true },
  });

  const inactiveProducts = await db.product.count({
    where: { isAvailableForPurchase: false },
  });

  return {
    active: activeProducts,
    inactive: inactiveProducts,
  };
}

export default async function AdminDashboard() {

  const session = await requireAdmin();  
   
  const [salesData, userData, productData] = await Promise.all([
    getSalesData(),
    getUserData(),
    getProductData(),
  ])
    
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard
            title="Sales"
            subtitle={`${salesData.orderCount} Orders`}
            body={formatCurrency(salesData.totalRevenue)}
        />

        <DashboardCard
            title="Customers"
            subtitle={`Avg Order: R${userData.averageOrderValue.toFixed(2)}`}
            body={`${userData.userCount} Users`}
        />

        <DashboardCard
            title="Active Products"
            subtitle={`${productData.inactive} Inactive`}
            body={`${productData.active} Active`}
        />
    </div>  
    
  )
}

type DashboardCardProps = {
  title: string
  subtitle: string
  body: string
}

function DashboardCard({ title, subtitle, body }: DashboardCardProps) {
  return (
    <Card className="shadow-md rounded-xl border border-border bg-card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{body}</p>
      </CardContent>
    </Card>
  )
}