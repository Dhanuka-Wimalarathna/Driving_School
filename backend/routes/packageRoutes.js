import express from 'express';
import { addPackage, getPackages, updatePackage, deletePackage } from '../controllers/packageController.js';

const router = express.Router();

// POST request to add a package
router.post('/addPackage', addPackage);

// GET request to fetch all packages
router.get('/', getPackages);

// PUT request to update a package
router.put('/:id', updatePackage);

// DELETE request to delete a package
router.delete('/:id', deletePackage);

export default router;
