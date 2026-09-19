import { type NextRequest, NextResponse } from "next/server"
import { uploadImageToCloudinary } from "@/lib/cloudinary/upload"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const folder = (formData.get("folder") as string) || "leo-club"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const result = await uploadImageToCloudinary(file, folder)

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed"
    console.error("Upload error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
