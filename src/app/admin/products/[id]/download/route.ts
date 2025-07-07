// src\app\admin\products\[id]\download\route.ts

// src/app/admin/products/[id]/download/route.ts

import { db } from "@/server/db";
import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import mime from "mime";

export async function GET(
  req: NextRequest,
  { params: { id } }: { params: { id: string } }
) {
  const product = await db.product.findUnique({
    where: { id },
    select: { filePath: true, name: true },
  });

  if (!product) return notFound();

  try {
    const filePath = path.join(process.cwd(), "public", product.filePath.replace(/^\/+/, ""));

    const file = await fs.readFile(filePath);
    const { size } = await fs.stat(filePath);

    const extension = path.extname(filePath).slice(1); // removes dot
    const mimeType = mime.getType(extension) || "application/octet-stream";

    return new NextResponse(file, {
      headers: {
        "Content-Disposition": `attachment; filename="${product.name}.${extension}"`,
        "Content-Length": size.toString(),
        "Content-Type": mimeType,
      },
    });
  } catch (error) {
    console.error("Download failed:", error);
    return new NextResponse("Failed to download file", { status: 500 });
  }
}

