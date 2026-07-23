import { NextRequest, NextResponse } from "next/server";
import { writeFile, readdir, stat, unlink } from "fs/promises";
import { join } from "path";

const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB limit
const UPLOAD_DIR = join(process.cwd(), "public", "uploads", "opportunity-score");
const MAX_AGE_MS = 48 * 60 * 60 * 1000; // 48 hours

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("creative") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: "File size exceeds 30MB limit" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Ensure unique filename
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const filePath = join(UPLOAD_DIR, filename);

        await writeFile(filePath, buffer);

        // Best effort background cleanup of files older than 48 hours
        cleanupOldFiles().catch(console.error);

        return NextResponse.json({
            success: true,
            filename,
            url: `/uploads/opportunity-score/${filename}`
        });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "File upload failed" }, { status: 500 });
    }
}

async function cleanupOldFiles() {
    try {
        const files = await readdir(UPLOAD_DIR);
        const now = Date.now();

        for (const file of files) {
            // skip .gitkeep or other hidden files
            if (file.startsWith(".")) continue;

            const filePath = join(UPLOAD_DIR, file);
            const stats = await stat(filePath);

            // If file is older than 48 hours, delete it
            if (now - stats.mtimeMs > MAX_AGE_MS) {
                await unlink(filePath);
                console.log(`Cleaned up old Opportunity Score upload: ${file}`);
            }
        }
    } catch (error) {
        console.error("Cleanup error:", error);
    }
}
