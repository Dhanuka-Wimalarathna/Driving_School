import sqldb from '../config/sqldb.js';
import dotenv from 'dotenv';

dotenv.config();

// Add a new package along with its vehicles
export const addPackage = (req, res) => {
    console.log(req.body);
    const { title, description, price, details, vehicles } = req.body;

    if (!title || !price || !vehicles || vehicles.length === 0) {
        return res.status(400).json({ message: "Please provide all required fields including vehicles" });
    }

    // Insert the new package into the database
    const packageQuery = 'INSERT INTO packages (title, description, price, details) VALUES (?, ?, ?, ?)';
    
    sqldb.query(packageQuery, [title, description, price, details], (err, packageResult) => {
        if (err) {
            console.error("Error adding package:", err);
            return res.status(500).json({ message: "Internal server error" });
        }

        const packageId = packageResult.insertId; // Get the new package ID

        // Insert vehicle-package relationships
        const vehicleQueries = vehicles.map(vehicle => {
            return new Promise((resolve, reject) => {
                const vehicleQuery = "INSERT INTO package_vehicles (package_id, vehicle_id, lesson_count) VALUES (?, ?, ?)";
                sqldb.query(vehicleQuery, [packageId, vehicle.vehicle_id, vehicle.lesson_count], (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
        });

        // Execute all vehicle insertions
        Promise.all(vehicleQueries)
            .then(() => {
                res.status(201).json({ message: "Package and vehicles added successfully", id: packageId });
            })
            .catch(error => {
                console.error("Error adding vehicles:", error);
                res.status(500).json({ message: "Error adding package-vehicle relationships" });
            });
    });
};

// Get all packages along with their assigned vehicles
export const getPackages = (req, res) => {
    const query = `
        SELECT 
            p.package_id AS package_id, p.title, p.description, p.price, p.details, 
            v.id AS vehicle_id, v.name AS vehicle_name, v.model, pv.lesson_count
        FROM packages p
        LEFT JOIN package_vehicles pv ON p.package_id = pv.package_id
        LEFT JOIN vehicles v ON pv.vehicle_id = v.id
    `;

    sqldb.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching packages:", err);
            return res.status(500).json({ message: "Internal server error" });
        }

        // Group packages and their vehicles
        const packagesMap = {};
        results.forEach(row => {
            if (!packagesMap[row.package_id]) {
                packagesMap[row.package_id] = {
                    id: row.package_id,
                    title: row.title,
                    description: row.description,
                    price: row.price,
                    details: row.details,
                    vehicles: []
                };
            }
            if (row.vehicle_id) {
                packagesMap[row.package_id].vehicles.push({
                    vehicle_id: row.vehicle_id,
                    name: row.vehicle_name,
                    model: row.model,
                    lesson_count: row.lesson_count
                });
            }
        });

        res.status(200).json(Object.values(packagesMap));
    });
};

// Update an existing package
export const updatePackage = (req, res) => {
    const { id } = req.params;
    const { title, description, price, details, vehicles } = req.body;

    if (!title || !price || !vehicles || vehicles.length === 0) {
        return res.status(400).json({ message: "Please provide all required fields including vehicles" });
    }

    // Step 1: Update package details
    const updatePackageQuery = `
        UPDATE packages 
        SET title = ?, description = ?, price = ?, details = ? 
        WHERE package_id = ?`;

    sqldb.query(updatePackageQuery, [title, description, price, details, id], (err, result) => {
        if (err) {
            console.error("Error updating package:", err);
            return res.status(500).json({ message: "Internal server error" });
        }

        // Step 2: Delete old vehicle relationships for the package
        const deleteVehiclesQuery = `DELETE FROM package_vehicles WHERE package_id = ?`;

        sqldb.query(deleteVehiclesQuery, [id], (deleteErr) => {
            if (deleteErr) {
                console.error("Error deleting old package vehicles:", deleteErr);
                return res.status(500).json({ message: "Internal server error" });
            }

            // Step 3: Insert updated vehicle relationships
            const vehicleQueries = vehicles.map(vehicle => {
                return new Promise((resolve, reject) => {
                    const insertVehicleQuery = `INSERT INTO package_vehicles (package_id, vehicle_id, lesson_count) VALUES (?, ?, ?)`;
                    sqldb.query(insertVehicleQuery, [id, vehicle.vehicle_id, vehicle.lesson_count], (insertErr, result) => {
                        if (insertErr) {
                            reject(insertErr);
                        } else {
                            resolve(result);
                        }
                    });
                });
            });

            // Execute all vehicle insertions
            Promise.all(vehicleQueries)
                .then(() => {
                    res.status(200).json({ message: "Package updated successfully" });
                })
                .catch(error => {
                    console.error("Error updating vehicles:", error);
                    res.status(500).json({ message: "Error updating package-vehicle relationships" });
                });
        });
    });
};

// Delete a package and its vehicle associations
export const deletePackage = (req, res) => {
    const { id } = req.params;

    // Delete package-vehicle relationships first
    const deleteVehiclesQuery = 'DELETE FROM package_vehicles WHERE package_id = ?';
    sqldb.query(deleteVehiclesQuery, [id], (err) => {
        if (err) {
            console.error("Error deleting package vehicles:", err);
            return res.status(500).json({ message: "Internal server error" });
        }

        // Then delete the package itself
        const deletePackageQuery = 'DELETE FROM packages WHERE package_id = ?';
        sqldb.query(deletePackageQuery, [id], (err, result) => {
            if (err) {
                console.error("Error deleting package:", err);
                return res.status(500).json({ message: "Internal server error" });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Package not found" });
            }
            res.status(200).json({ message: "Package deleted successfully" });
        });
    });
};
