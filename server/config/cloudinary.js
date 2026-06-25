/**
 * Cloudinary Configuration
 * Used for uploading images, videos, voice notes
 */

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Storage for Profile Avatars ─────────────────────────────────────────────
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'bitebond/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
  },
});

// ─── Storage for Gift/Food Images ─────────────────────────────────────────────
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'bitebond/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 600, crop: 'fill' }],
  },
});

// ─── Storage for Personalization (video, voice, photo) ────────────────────────
const personalizationStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video/');
    const isAudio = file.mimetype.startsWith('audio/');
    return {
      folder: 'bitebond/personalizations',
      resource_type: isVideo ? 'video' : isAudio ? 'video' : 'image', // Cloudinary uses 'video' for audio too
      allowed_formats: isVideo
        ? ['mp4', 'mov', 'avi']
        : isAudio
        ? ['mp3', 'wav', 'ogg', 'm4a']
        : ['jpg', 'jpeg', 'png', 'webp'],
    };
  },
});

// Multer upload instances
const uploadAvatar = multer({ storage: avatarStorage });
const uploadProduct = multer({ storage: productStorage });
const uploadPersonalization = multer({ storage: personalizationStorage });

/**
 * Delete a file from Cloudinary by public_id
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadAvatar,
  uploadProduct,
  uploadPersonalization,
  deleteFromCloudinary,
};
