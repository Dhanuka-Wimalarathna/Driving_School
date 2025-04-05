import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import "./Students.css";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredStudents(students);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = students.filter(
        (student) =>
          student.firstName.toLowerCase().includes(query) ||
          student.lastName.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query) ||
          (student.phone && student.phone.includes(query)) ||
          student.id.toString().includes(query)
      );
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);

  const fetchStudents = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/students");
      const mappedStudents = response.data.map((student) => ({
        id: student.STU_ID,
        firstName: student.FIRST_NAME,
        lastName: student.LAST_NAME,
        email: student.EMAIL,
        phone: student.PHONE,
        dateOfBirth: student.DATE_OF_BIRTH,
        address: student.ADDRESS,
        createdAt: student.CREATED_AT,
        selectedPackage: student.SELECTED_PACKAGE || "None",
      }));
      setStudents(mappedStudents);
      setFilteredStudents(mappedStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
      setFilteredStudents([]);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleViewClick = (student) => {
    navigate(`/admin/students/${student.id}`, { state: { student } });
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <div className="students-page">
          <div className="students-header">
            <h1>Students</h1>
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Search students..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          <div className="students-table-container">
            <table className="students-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Package</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td className="student-id">{student.id}</td>
                      <td>{student.firstName} {student.lastName}</td>
                      <td className="student-email">{student.email}</td>
                      <td>{student.phone || "N/A"}</td>
                      <td>{student.selectedPackage}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="view-btn"
                            onClick={() => handleViewClick(student)}
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-results">
                      No students found matching your search
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Students;