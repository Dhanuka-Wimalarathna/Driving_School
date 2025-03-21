import sqldb from "../config/sqldb.js";

// Get all students
export const getStudents = (req, res) => {
    const query = "SELECT * FROM student"; // Adjust table name if needed

    sqldb.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching students:", err);
            return res.status(500).json({ message: "Internal server error" });
        }
        res.status(200).json(results);
    });
};
