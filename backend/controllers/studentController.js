import sqldb from "../config/sqldb.js";

// Get all students
export const getStudents = (req, res) => {
    const query = `
        SELECT 
            s.STU_ID, 
            s.FIRST_NAME, 
            s.LAST_NAME, 
            s.EMAIL, 
            s.PHONE, 
            s.BIRTHDAY AS DATE_OF_BIRTH, 
            s.ADDRESS, 
            s.CREATED_AT,
            p.title AS SELECTED_PACKAGE
        FROM student s
        LEFT JOIN selected_packages sp ON s.STU_ID = sp.student_id
        LEFT JOIN packages p ON sp.package_id = p.package_id
    `;

    sqldb.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching students:", err);
            return res.status(500).json({ message: "Internal server error" });
        }
        res.status(200).json(results);
    });
};
