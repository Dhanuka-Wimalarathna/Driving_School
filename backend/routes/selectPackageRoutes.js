import express from 'express';
import { selectPackage } from '../controllers/selectPackageController.js';
import authenticateToken from '../middleware/authMiddleware.js';

const router = express.Router();

// router.post('/select-package', selectPackage);

router.post('/select-package', authenticateToken, selectPackage);

export default router;
