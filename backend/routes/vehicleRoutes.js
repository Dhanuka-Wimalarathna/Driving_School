import express from 'express';
import { addVehicle, getVehicles } from '../controllers/vehicleController.js';

const router = express.Router();

// POST request to add a vehicle
router.post('/addVehicle', addVehicle);

// GET request to fetch all vehicles
router.get('/', getVehicles);

export default router;
