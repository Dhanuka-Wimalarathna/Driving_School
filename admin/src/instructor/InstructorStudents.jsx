import React, { useState, useEffect } from "react";
import axios from "axios";
import InstructorSidebar from "../components/Sidebar/InstructorSidebar";
import { useNavigate } from "react-router-dom";
import { Search, Eye, AlertCircle, User } from "lucide-react";
import "./InstructorStudents.css";

const InstructorStudents = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

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
    setIsLoading(true);
    setErrorMessage("");
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
      setErrorMessage("Failed to load student data. Please try again later.");
      setStudents([]);
      setFilteredStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleViewClick = (student) => {
    navigate(`/instructor/students/${student.id}`, { state: { student } });
  };

  return (
    <div className="dashboard-layout">
    <InstructorSidebar />
      <main className="students-main-content">
        <div className="students-container">
          <header className="students-header">
            <div className="header-title">
              <h1>
                <span className="title-icon">
                  <User size={24} />
                </span>
                Students
              </h1>
              <p className="subtitle">
                {filteredStudents.length} {filteredStudents.length === 1 ? "student" : "students"} enrolled
              </p>
            </div>
            
            <div className="search-wrapper">
              <div className="search-container">
                <Search className="search-icon" size={18} />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by name, email, ID..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </header>

          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading students data...</p>
            </div>
          ) : errorMessage ? (
            <div className="error-container">
              <AlertCircle size={24} />
              <p>{errorMessage}</p>
              <button className="retry-btn" onClick={fetchStudents}>Retry</button>
            </div>
          ) : (
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
                        <td className="student-name">
                          <div className="name-cell">
                            <div className="avatar">{student.firstName.charAt(0)}{student.lastName.charAt(0)}</div>
                            <div className="name-text">{student.firstName} {student.lastName}</div>
                          </div>
                        </td>
                        <td className="student-email">{student.email}</td>
                        <td>{student.phone || "—"}</td>
                        <td>
                          <span className={`package-badge ${student.selectedPackage.toLowerCase() === "none" ? "none" : "active"}`}>
                            {student.selectedPackage}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="view-btn"
                              onClick={() => handleViewClick(student)}
                              title="View student details"
                            >
                              <Eye size={16} />
                              <span>Mark Progress</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-results">
                        <div className="no-data">
                          <Search size={32} />
                          <p>No students found matching your search</p>
                          {searchQuery && (
                            <button className="clear-search" onClick={() => setSearchQuery("")}>
                              Clear search
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default InstructorStudents;