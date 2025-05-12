import express from 'express';
import { 
    addVehicle, 
    getVehicles,
    updateVehicleStatus,
    deleteVehicle
} from '../controllers/vehicleController.js';

const router = express.Router();

// POST request to add a vehicle
router.post('/addVehicle', addVehicle);

// GET request to fetch all vehicles
router.get('/', getVehicles);

// PUT request to update vehicle status
router.put('/:id/status', updateVehicleStatus);

// DELETE request to delete a vehicle
router.delete('/:id', deleteVehicle);

export default router;