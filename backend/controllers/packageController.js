import sqldb from '../config/sqldb.js';
import dotenv from 'dotenv';

dotenv.config();

// Add a new package
export const addPackage = (req, res) => {
    console.log(req.body);
    const { title, description, price, details } = req.body;

    const query = 'INSERT INTO packages (title, description, price, details) VALUES (?, ?, ?, ?)';
    sqldb.query(query, [title, description, price, details], (err, result) => {
        if (err) {
            console.error('Error adding package:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        res.status(201).json({ message: 'Package added successfully', id: result.insertId });
    });
};

// Get all packages
export const getPackages = (req, res) => {
    const query = 'SELECT * FROM packages';
    sqldb.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching packages:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        res.status(200).json(results);
    });
};

// Delete a package
export const deletePackage = (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM packages WHERE id = ?';
    sqldb.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error deleting package:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Package not found' });
        }
        res.status(200).json({ message: 'Package deleted successfully' });
    });
};
