import { 
  getAllStudyMaterials,
  createStudyMaterial,
  deleteStudyMaterial as deleteStudyMaterialModel,
  getStudyMaterialById
} from '../models/studyMaterialModel.js';
import cloudinary from '../config/cloudinary.js';
import stream from 'stream';

// Get all study materials
export const getStudyMaterials = (req, res) => {
  getAllStudyMaterials((err, results) => {
    if (err) {
      console.error('Error fetching study materials:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch study materials'
      });
    }
    
    res.status(200).json(results || []);
  });
};

// Upload a study material
export const uploadStudyMaterial = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { title, description, category } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    // Create a buffer from the file data
    const buffer = req.file.buffer;
    const fileSize = buffer.length;

    // Create a readable stream from the buffer
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);

    // Upload the file to Cloudinary via stream
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'study_materials',
          resource_type: 'auto', // auto-detect the file type
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      bufferStream.pipe(uploadStream);
    });

    // Create the study material entry in the database
    const materialData = {
      title,
      description: description || '',
      category: category || 'theory',
      file_url: result.secure_url,
      file_type: req.file.mimetype,
      file_size: fileSize,
      cloudinary_id: result.public_id,
      created_by: req.userId // assuming the user ID is set in the auth middleware
    };

    createStudyMaterial(materialData, (err, dbResult) => {
      if (err) {
        console.error('Error creating study material in database:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to save study material information'
        });
      }

      res.status(201).json({
        success: true,
        message: 'Study material uploaded successfully',
        material: {
          id: dbResult.insertId,
          ...materialData,
          created_at: new Date().toISOString()
        }
      });
    });
  } catch (error) {
    console.error('Error uploading study material:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload study material',
      error: error.message
    });
  }
};

// Delete a study material
export const deleteStudyMaterial = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'Material ID is required'
    });
  }

  try {
    // First get the study material to get the Cloudinary ID
    getStudyMaterialById(id, async (err, material) => {
      if (err) {
        console.error('Error getting study material:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to retrieve study material'
        });
      }

      if (!material) {
        return res.status(404).json({
          success: false,
          message: 'Study material not found'
        });
      }

      // Delete from Cloudinary if cloudinary_id exists
      if (material.cloudinary_id) {
        try {
          await cloudinary.uploader.destroy(material.cloudinary_id);
        } catch (cloudinaryError) {
          console.error('Error deleting from Cloudinary:', cloudinaryError);
          // We'll continue to delete from the database even if Cloudinary deletion fails
        }
      }

      // Delete from database
      deleteStudyMaterialModel(id, (deleteErr) => {
        if (deleteErr) {
          console.error('Error deleting study material from database:', deleteErr);
          return res.status(500).json({
            success: false,
            message: 'Failed to delete study material'
          });
        }

        res.status(200).json({
          success: true,
          message: 'Study material deleted successfully'
        });
      });
    });
  } catch (error) {
    console.error('Error in deleteStudyMaterial:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting study material'
    });
  }
};

// Get a single study material by ID
export const getStudyMaterialDetail = (req, res) => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'Material ID is required'
    });
  }
  
  getStudyMaterialById(id, (err, material) => {
    if (err) {
      console.error('Error getting study material:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve study material'
      });
    }
    
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found'
      });
    }
    
    res.status(200).json({
      success: true,
      material
    });
  });
}; 