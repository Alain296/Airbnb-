import { Response } from "express";
import prisma from "../config/prisma";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary";
import { AuthRequest } from "../middlewares/auth.middleware";
import { handleControllerError } from "../utils/error-handler";
import { getParamAsString } from "../utils/params";

const omitPassword = <T extends { password?: string }>(user: T): Omit<T, "password"> => {
  const { password: _password, ...rest } = user;
  return rest;
};

/**
 * Upload user avatar
 * POST /users/:id/avatar
 */
export const uploadAvatar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = getParamAsString(req.params.id);

    // Check ownership
    if (req.userId !== userId) {
      res.status(403).json({ message: "You can only update your own avatar" });
      return;
    }

    // Check if file was uploaded
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Delete old avatar from Cloudinary if exists
    if (user.avatarPublicId) {
      await deleteFromCloudinary(user.avatarPublicId);
    }

    // Upload new avatar to Cloudinary
    const { url, publicId } = await uploadToCloudinary(
      req.file.buffer,
      "airbnb/avatars"
    );

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        avatar: url,
        avatarPublicId: publicId,
      },
    });

    res.status(200).json(omitPassword(updatedUser));
  } catch (error) {
    handleControllerError(error, res, "upload.uploadAvatar");
  }
};

/**
 * Delete user avatar
 * DELETE /users/:id/avatar
 */
export const deleteAvatar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = getParamAsString(req.params.id);

    // Check ownership
    if (req.userId !== userId) {
      res.status(403).json({ message: "You can only delete your own avatar" });
      return;
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Check if user has an avatar
    if (!user.avatar) {
      res.status(400).json({ message: "No avatar to remove" });
      return;
    }

    // Delete from Cloudinary
    if (user.avatarPublicId) {
      await deleteFromCloudinary(user.avatarPublicId);
    }

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        avatar: null,
        avatarPublicId: null,
      },
    });

    res.status(200).json({
      message: "Avatar removed successfully",
      user: omitPassword(updatedUser),
    });
  } catch (error) {
    handleControllerError(error, res, "upload.deleteAvatar");
  }
};


/**
 * Upload listing photos (up to 5)
 * POST /listings/:id/photos
 */
export const uploadListingPhotos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const listingId = getParamAsString(req.params.id);

    // Find listing
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { photos: true },
    });

    if (!listing) {
      res.status(404).json({ message: "Listing not found" });
      return;
    }

    // Check ownership
    if (listing.hostId !== req.userId) {
      res.status(403).json({ message: "You can only upload photos to your own listings" });
      return;
    }

    // Check if files were uploaded
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({ message: "No files uploaded" });
      return;
    }

    // Check current photo count
    const existingCount = listing.photos.length;
    if (existingCount >= 5) {
      res.status(400).json({ message: "Maximum of 5 photos allowed per listing" });
      return;
    }

    // Calculate how many photos we can upload
    const remainingSlots = 5 - existingCount;
    const filesToUpload = req.files.slice(0, remainingSlots);

    // Upload photos to Cloudinary
    const uploadPromises = filesToUpload.map((file) =>
      uploadToCloudinary(file.buffer, "airbnb/listings")
    );

    const uploadResults = await Promise.all(uploadPromises);

    // Create photo records in database
    const photoPromises = uploadResults.map((result) =>
      prisma.listingPhoto.create({
        data: {
          url: result.url,
          publicId: result.publicId,
          listingId,
        },
      })
    );

    await Promise.all(photoPromises);

    // Fetch updated listing with photos
    const updatedListing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { photos: true },
    });

    res.status(200).json(updatedListing);
  } catch (error) {
    handleControllerError(error, res, "upload.uploadListingPhotos");
  }
};

/**
 * Delete a specific listing photo
 * DELETE /listings/:id/photos/:photoId
 */
export const deleteListingPhoto = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const listingId = getParamAsString(req.params.id);
    const photoId = getParamAsString(req.params.photoId);

    // Find listing
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      res.status(404).json({ message: "Listing not found" });
      return;
    }

    // Check ownership
    if (listing.hostId !== req.userId) {
      res.status(403).json({ message: "You can only delete photos from your own listings" });
      return;
    }

    // Find photo
    const photo = await prisma.listingPhoto.findUnique({
      where: { id: photoId },
    });

    if (!photo) {
      res.status(404).json({ message: "Photo not found" });
      return;
    }

    // Verify photo belongs to this listing
    if (photo.listingId !== listingId) {
      res.status(403).json({ message: "Photo does not belong to this listing" });
      return;
    }

    // Delete from Cloudinary
    await deleteFromCloudinary(photo.publicId);

    // Delete from database
    await prisma.listingPhoto.delete({
      where: { id: photoId },
    });

    res.status(200).json({ message: "Photo deleted successfully" });
  } catch (error) {
    handleControllerError(error, res, "upload.deleteListingPhoto");
  }
};
