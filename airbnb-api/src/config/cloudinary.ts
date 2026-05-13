import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

// Configure Cloudinary
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

// Verify configuration on startup
if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
  console.log("Cloudinary configured successfully");
} else {
  console.warn("Cloudinary credentials not configured. Image uploads will not work.");
}

/**
 * Upload image to Cloudinary
 * @param buffer - Image buffer from multer
 * @param folder - Cloudinary folder (e.g., "airbnb/avatars")
 * @returns Object with url and publicId
 */
export const uploadToCloudinary = (
  buffer: Buffer,
  folder: string
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto", // Automatically detect file type
      },
      (error, result: UploadApiResponse | undefined) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            url: result.secure_url, // Always use HTTPS
            publicId: result.public_id,
          });
        } else {
          reject(new Error("Upload failed - no result returned"));
        }
      }
    );

    // Write buffer to stream
    uploadStream.end(buffer);
  });
};

/**
 * Delete image from Cloudinary
 * @param publicId - Cloudinary public_id
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`Deleted image from Cloudinary: ${publicId}`);
  } catch (error) {
    console.error(`Failed to delete image from Cloudinary: ${publicId}`, error);
    // Don't throw - deletion failure shouldn't break the API
  }
};

/**
 * Get optimized image URL with transformations
 * @param url - Original Cloudinary URL
 * @param width - Desired width
 * @param height - Desired height
 * @returns Optimized URL
 */
export const getOptimizedUrl = (url: string, width: number, height: number): string => {
  // Insert transformations into Cloudinary URL
  // Example: https://res.cloudinary.com/demo/image/upload/w_400,h_300,c_fill,f_auto,q_auto/sample.jpg
  const transformation = `w_${width},h_${height},c_fill,f_auto,q_auto`;
  return url.replace("/upload/", `/upload/${transformation}/`);
};
