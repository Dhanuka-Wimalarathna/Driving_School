import express from 'express';
import multer from 'multer';
import {
  getStudyMaterials,
  uploadStudyMaterial,
  deleteStudyMaterial,
  getStudyMaterialDetail
} from '../controllers/studyMaterialController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Multer setup for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Get all study materials (public route)
router.get('/', getStudyMaterials);

// Get study material detail by ID (public route)
router.get('/:id', getStudyMaterialDetail);

// Upload study material (protected route)
router.post('/upload', authMiddleware, upload.single('file'), uploadStudyMaterial);

// Delete study material (protected route)
router.delete('/:id', authMiddleware, deleteStudyMaterial);

export default router; 