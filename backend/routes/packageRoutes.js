import express from 'express';
import { addPackage, getPackages, deletePackage } from '../controllers/packageController.js';

const router = express.Router();

// POST request to add a package
router.post('/addPackage', addPackage);

// GET request to fetch all packages
router.get('/', getPackages);

// DELETE request to delete a package
router.delete('/:id', deletePackage);

export default router;
