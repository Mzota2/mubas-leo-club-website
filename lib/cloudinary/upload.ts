import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadImageToCloudinary(file: File, folder = "leo-club") {
  const buffer = await file.arrayBuffer()
  const bytes = Buffer.from(buffer)

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result)
          }
        },
      )
      .end(bytes)
  })
}

export function getCloudinaryUrl(publicId: string, transformations?: Record<string, any>) {
  return cloudinary.url(publicId, transformations)
}
