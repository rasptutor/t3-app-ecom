// /app/api/upload/route.ts
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
    try{
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        console.log("Received file:", file.name, file.size);

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        //const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = file.name.replace(/[^a-z0-9_.-]/gi, "_").toLowerCase();
        //const uploadDir = path.join(process.cwd(), "public/uploads");
        const uploadDir = path.join(process.cwd(), "public", "uploads");

        // Make sure directory exists
        await mkdir(uploadDir, { recursive: true });

        //const fileName = file.name.replace(/[^a-z0-9.\-_]/gi, "_").toLowerCase();
        const filePath = path.join(uploadDir, fileName);

        await writeFile(filePath, buffer);

        console.log("File saved to:", filePath);

        return NextResponse.json({ url: `/uploads/${fileName}` });
    } catch (err) {
        console.error("Upload error:", err)
        return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
        )
  }
  
}
