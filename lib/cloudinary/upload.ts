import { v2 as cloudinary } from "cloudinary"

function trim(value?: string | null) {
  return (value ?? "").trim()
}

function fromCloudinaryUrl() {
  const raw = trim(process.env.CLOUDINARY_URL)
  if (!raw.startsWith("cloudinary://")) return {}
  try {
    const parsed = new URL(raw.replace("cloudinary://", "https://"))
    return {
      cloud_name: parsed.hostname,
      api_key: decodeURIComponent(parsed.username),
      api_secret: decodeURIComponent(parsed.password),
    }
  } catch {
    return {}
  }
}

function cloudinaryCredentials() {
  const fromUrl = fromCloudinaryUrl()
  return {
    cloud_name: trim(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) || fromUrl.cloud_name || "",
    api_key: trim(process.env.CLOUDINARY_API_KEY) || fromUrl.api_key || "",
    api_secret: trim(process.env.CLOUDINARY_API_SECRET) || fromUrl.api_secret || "",
    upload_preset: trim(process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET),
  }
}

function configureCloudinary() {
  const { cloud_name, api_key, api_secret } = cloudinaryCredentials()
  if (!cloud_name) return
  cloudinary.config({ cloud_name, api_key, api_secret, secure: true }, true)
}

async function uploadUnsigned(file: File, folder: string) {
  const { cloud_name, upload_preset } = cloudinaryCredentials()
  if (!cloud_name || !upload_preset) {
    throw new Error("Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.")
  }

  const send = async (includeFolder: boolean) => {
    const body = new FormData()
    body.append("file", file)
    body.append("upload_preset", upload_preset)
    if (includeFolder && folder) body.append("folder", folder)

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, {
      method: "POST",
      body,
    })
    const data = (await response.json()) as { secure_url?: string; url?: string; error?: { message?: string } }
    if (!response.ok || (!data.secure_url && !data.url)) {
      throw new Error(data.error?.message || "Cloudinary unsigned upload failed.")
    }
    return data
  }

  try {
    return await send(true)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    if (/folder|not allowed|unsigned/i.test(message)) {
      return await send(false)
    }
    throw error
  }
}

export async function uploadImageToCloudinary(file: File, folder = "leo-club") {
  return uploadUnsigned(file, folder)
}

export function getCloudinaryUrl(publicId: string, transformations?: Record<string, unknown>) {
  configureCloudinary()
  return cloudinary.url(publicId, transformations)
}
