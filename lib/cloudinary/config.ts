export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "",
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "",
}

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const cloudName = cloudinaryConfig.cloudName.trim()
  const uploadPreset = cloudinaryConfig.uploadPreset.trim()
  if (!cloudName || !uploadPreset) {
    throw new Error("Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.")
  }

  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", uploadPreset)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  })
  const data = await response.json()
  if (!data.secure_url) {
    throw new Error(data.error?.message || "Cloudinary unsigned upload failed.")
  }
  return data.secure_url
}
