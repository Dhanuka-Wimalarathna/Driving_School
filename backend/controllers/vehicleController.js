import sqldb from '../config/sqldb.js';
import dotenv from 'dotenv';

dotenv.config();

// Add a new vehicle
export const addVehicle = (req, res) => {
    console.log(req.body);
    const { name, model, plate_number, type, status } = req.body;

    const query = 'INSERT INTO vehicles (name, model, plate_number, type, status) VALUES (?, ?, ?, ?, ?)';
    sqldb.query(query, [name, model, plate_number, type, status], (err, result) => {
        if (err) {
            console.error('Error adding vehicle:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        res.status(201).json({ message: 'Vehicle added successfully', id: result.insertId });
    });
};

// Get all vehicles
export const getVehicles = (req, res) => {
    const query = 'SELECT * FROM vehicles';
    sqldb.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching vehicles:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        res.status(200).json(results);
    });
};
