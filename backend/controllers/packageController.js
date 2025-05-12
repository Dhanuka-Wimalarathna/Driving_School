import sqldb from '../config/sqldb.js';
import dotenv from 'dotenv';

dotenv.config();

// Add a new package
export const addPackage = (req, res) => {
    const { title, description, price, details, 
           bike_sessions, tricycle_sessions, van_sessions } = req.body;

    if (!title || !price) {
        return res.status(400).json({ message: "Title and price are required" });
    }

    const numericFields = {
        price: parseFloat(price),
        bike_sessions: bike_sessions ? parseInt(bike_sessions) : 0,
        tricycle_sessions: tricycle_sessions ? parseInt(tricycle_sessions) : 0,
        van_sessions: van_sessions ? parseInt(van_sessions) : 0
    };

    if (Object.values(numericFields).some(isNaN)) {
        return res.status(400).json({ message: "Invalid numeric values" });
    }

    const query = `
        INSERT INTO packages 
        (title, description, price, details, bike_sessions, tricycle_sessions, van_sessions)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    sqldb.query(query, [
        title,
        description,
        numericFields.price,
        details,
        numericFields.bike_sessions,
        numericFields.tricycle_sessions,
        numericFields.van_sessions
    ], (err, result) => {
        if (err) {
            console.error("Error adding package:", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.status(201).json({ 
            message: "Package added successfully",
            id: result.insertId
        });
    });
};

// Get all packages
export const getPackages = (req, res) => {
    const query = `
        SELECT 
            package_id AS id,
            title,
            description,
            price,
            details,
            bike_sessions,
            tricycle_sessions,
            van_sessions
        FROM packages
        ORDER BY price ASC
    `;

    sqldb.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching packages:", err);
            return res.status(500).json({ message: "Database error" });
        }
        
        // Format the price as a number (not string)
        const formattedResults = results.map(pkg => ({
            ...pkg,
            price: parseFloat(pkg.price)
        }));
        
        res.status(200).json(formattedResults);
    });
};

// Update an existing package
export const updatePackage = (req, res) => {
    const { id } = req.params;
    const { title, description, price, details, 
           bike_sessions, tricycle_sessions, van_sessions } = req.body;

    if (!title || !price) {
        return res.status(400).json({ message: "Title and price are required" });
    }

    const numericFields = {
        price: parseFloat(price),
        bike_sessions: bike_sessions ? parseInt(bike_sessions) : 0,
        tricycle_sessions: tricycle_sessions ? parseInt(tricycle_sessions) : 0,
        van_sessions: van_sessions ? parseInt(van_sessions) : 0
    };

    if (Object.values(numericFields).some(isNaN)) {
        return res.status(400).json({ message: "Invalid numeric values" });
    }

    const query = `
        UPDATE packages 
        SET 
            title = ?, 
            description = ?, 
            price = ?, 
            details = ?,
            bike_sessions = ?,
            tricycle_sessions = ?,
            van_sessions = ?
        WHERE package_id = ?
    `;

    sqldb.query(query, [
        title,
        description,
        numericFields.price,
        details,
        numericFields.bike_sessions,
        numericFields.tricycle_sessions,
        numericFields.van_sessions,
        id
    ], (err, result) => {
        if (err) {
            console.error("Error updating package:", err);
            return res.status(500).json({ message: "Database error" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Package not found" });
        }
        res.status(200).json({ message: "Package updated successfully" });
    });
};

// Delete a package
export const deletePackage = (req, res) => {
    const { id } = req.params;

    const deletePackageQuery = 'DELETE FROM packages WHERE package_id = ?';
    sqldb.query(deletePackageQuery, [id], (err, result) => {
        if (err) {
            console.error("Error deleting package:", err);
            return res.status(500).json({ message: "Database error" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Package not found" });
        }
        res.status(200).json({ message: "Package deleted successfully" });
    });
};