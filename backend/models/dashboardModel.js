import sqldb from "../config/sqldb.js";

export const getTotalStudents = () => {
  return new Promise((resolve, reject) => {
   sqldb.query("SELECT COUNT(*) AS totalStudents FROM student", (err, result) => {
      if (err) return reject(err);
      resolve(result[0].totalStudents);
    });
  });
};

export const getActiveInstructors = () => {
  return new Promise((resolve, reject) => {
    sqldb.query("SELECT COUNT(*) AS activeInstructors FROM instructors", (err, result) => {
      if (err) return reject(err);
      resolve(result[0].activeInstructors);
    });
  });
};

