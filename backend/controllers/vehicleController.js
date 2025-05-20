import sqldb from '../config/sqldb.js';
import dotenv from 'dotenv';

dotenv.config();

// Add a new vehicle
export const addVehicle = (req, res) => {
    const { name, model, plate_number, type, status = 'Available' } = req.body;

    // Validate required fields
    if (!name || !plate_number || !type) {
        return res.status(400).json({ 
            message: "Name, plate number, and type are required fields" 
        });
    }

    // Validate type enum
    const validTypes = ['Van', 'Three-Wheeler', 'Bike'];
    if (!validTypes.includes(type)) {
        return res.status(400).json({ 
            message: "Invalid vehicle type" 
        });
    }

    // Validate status enum
    const validStatuses = ['Available', 'Unavailable', 'In Service', 'In use'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
            message: "Invalid vehicle status" 
        });
    }

    const query = 'INSERT INTO vehicles (name, model, plate_number, type, status) VALUES (?, ?, ?, ?, ?)';
    sqldb.query(query, [name, model, plate_number, type, status], (err, result) => {
        if (err) {
            console.error("Error adding vehicle:", err);
            return res.status(500).json({ 
                message: "Database error",
                error: err.message 
            });
        }
        res.status(201).json({ 
            message: "Vehicle added successfully", 
            vehicle: { 
                id: result.insertId, 
                name, 
                model, 
                plate_number, 
                type, 
                status 
            }
        });
    });
};

// Get all vehicles
export const getVehicles = (req, res) => {
    const query = 'SELECT * FROM vehicles ORDER BY created_at DESC';
    sqldb.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching vehicles:", err);
            return res.status(500).json({ 
                message: "Database error",
                error: err.message 
            });
        }
        res.status(200).json(results);
    });
};

// Update vehicle status
export const updateVehicleStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status enum
    const validStatuses = ['Available', 'Unavailable', 'In Service', 'In use'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
            message: "Invalid vehicle status" 
        });
    }

    const query = 'UPDATE vehicles SET status = ? WHERE id = ?';
    sqldb.query(query, [status, id], (err, result) => {
        if (err) {
            console.error("Error updating vehicle status:", err);
            return res.status(500).json({ 
                message: "Database error",
                error: err.message 
            });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                message: "Vehicle not found" 
            });
        }
        res.status(200).json({ 
            message: "Vehicle status updated successfully",
            id,
            status
        });
    });
};

// Delete a vehicle
export const deleteVehicle = (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM vehicles WHERE id = ?';
    sqldb.query(query, [id], (err, result) => {
        if (err) {
            console.error("Error deleting vehicle:", err);
            return res.status(500).json({ 
                message: "Database error",
                error: err.message 
            });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                message: "Vehicle not found" 
            });
        }
        res.status(200).json({ 
            message: "Vehicle deleted successfully",
            id
        });
    });
};