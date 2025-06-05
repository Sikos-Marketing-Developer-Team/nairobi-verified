const cloudinary = require('../config/cloudinary');
const Media = require('../models/Media');

class MediaService {
  async uploadImage(file, options = {}) {
    try {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(file.path, {
        folder: options.folder || 'nairobi-verified',
        resource_type: 'auto',
        ...options
      });

      // Store in MongoDB as backup
      const media = new Media({
        cloudinaryId: result.public_id,
        url: result.secure_url,
        type: result.resource_type,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        originalFilename: file.originalname,
        metadata: result
      });

      await media.save();

      return {
        success: true,
        data: {
          id: media._id,
          url: result.secure_url,
          publicId: result.public_id,
          type: result.resource_type,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes
        }
      };
    } catch (error) {
      console.error('Media upload error:', error);
      throw new Error('Failed to upload media');
    }
  }

  async deleteImage(publicId) {
    try {
      // Delete from Cloudinary
      await cloudinary.uploader.destroy(publicId);

      // Delete from MongoDB
      await Media.findOneAndDelete({ cloudinaryId: publicId });

      return { success: true };
    } catch (error) {
      console.error('Media deletion error:', error);
      throw new Error('Failed to delete media');
    }
  }

  async getImage(publicId) {
    try {
      // Try to get from MongoDB first
      const media = await Media.findOne({ cloudinaryId: publicId });
      
      if (media) {
        return {
          success: true,
          data: {
            id: media._id,
            url: media.url,
            publicId: media.cloudinaryId,
            type: media.type,
            format: media.format,
            width: media.width,
            height: media.height,
            bytes: media.bytes
          }
        };
      }

      // If not in MongoDB, try to get from Cloudinary
      const result = await cloudinary.api.resource(publicId);
      
      // Store in MongoDB for future reference
      const newMedia = new Media({
        cloudinaryId: result.public_id,
        url: result.secure_url,
        type: result.resource_type,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        metadata: result
      });

      await newMedia.save();

      return {
        success: true,
        data: {
          id: newMedia._id,
          url: result.secure_url,
          publicId: result.public_id,
          type: result.resource_type,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes
        }
      };
    } catch (error) {
      console.error('Media retrieval error:', error);
      throw new Error('Failed to retrieve media');
    }
  }
}

module.exports = new MediaService(); 