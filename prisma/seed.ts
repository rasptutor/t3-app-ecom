// /prisma/seed.ts

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Utility to generate a slug
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  console.log("🌱 Seeding database...");

  // Cleanup (for development only)
  await prisma.downloadVerification.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create demo user
  const user = await prisma.user.create({
    data: {
      name: "Demo User",
      email: "demo@example.com",
    },
  });

  // 2. Create products
  const productData = [
    {
      name: "Design Pack",
      slug: slugify("Design Pack"),
      priceInCents: 2500,
      filePath: "/downloads/design-pack.zip",
      imagePath: "/images/design-pack.png",
      description: "A high-quality UI kit for modern apps.",
    },
    {
      name: "Code Snippet Bundle",
      slug: slugify("Code Snippet Bundle"),
      priceInCents: 1800,
      filePath: "/downloads/code-snippets.zip",
      imagePath: "/images/code-snippets.png",
      description: "Reusable code snippets for faster development.",
    },
    {
      name: "Dev Cheatsheets",
      slug: slugify("Dev Cheatsheets"),
      priceInCents: 1200,
      filePath: "/downloads/cheatsheets.pdf",
      imagePath: "/images/cheatsheets.png",
      description: "Printable developer cheatsheets.",
    },
  ];

  await prisma.product.createMany({
    data: productData,
  });

  // 3. Re-fetch all products with IDs
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "asc" },
  });

  // 4. Create orders and download verifications for each product
  for (const product of products) {
    await prisma.order.create({
      data: {
        userId: user.id,
        productId: product.id,
        pricePaidInCents: product.priceInCents,
      },
    });

    await prisma.downloadVerification.create({
      data: {
        userId: user.id,
        productId: product.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // 3 days from now
      },
    });
  }

  console.log("✅ Seeding complete.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

