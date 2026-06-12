import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(base64: string, folder: string): Promise<string> {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return `https://placehold.co/400x400?text=${encodeURIComponent(folder)}`;
  }

  const result = await cloudinary.uploader.upload(base64, {
    folder: `campus-mall/${folder}`,
    resource_type: 'image',
  });
  return result.secure_url;
}
