import express from 'express';
import { selectPackage, getSelectedPackage } from '../controllers/selectPackageController.js';
import authenticateToken from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/select-package', authenticateToken, selectPackage);
router.get('/select-package/get-selected-package', authenticateToken, getSelectedPackage);

export default router;