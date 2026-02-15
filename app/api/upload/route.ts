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
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
