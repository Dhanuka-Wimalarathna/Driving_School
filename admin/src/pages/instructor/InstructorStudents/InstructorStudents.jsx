import React, { useState, useEffect } from "react";
import axios from "axios";
import InstructorSidebar from '../../../components/Sidebar/InstructorSidebar';
import { useNavigate } from "react-router-dom";
import { Search, Eye, AlertCircle, User, Clock } from "lucide-react";
import styles from "./InstructorStudents.module.css";

const InstructorStudents = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className={styles['dashboard-layout']}>
      <InstructorSidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <main className={`${styles['students-main-content']} ${sidebarCollapsed ? styles['collapsed'] : ''}`}>
        <div className={styles['students-container']}>
          <header className={styles['students-header']}>
            <div className={styles['header-title']}>
              <h1>
                <span className={styles['title-icon']}>
                  <User size={24} />
                </span>
                Students
              </h1>
              <p className={styles['subtitle']}>
                {filteredStudents.length} {filteredStudents.length === 1 ? "student" : "students"} enrolled
              </p>
            </div>
            
            <div className={styles['search-wrapper']}>
              <div className={styles['search-container']}>
                <Search className={styles['search-icon']} size={18} />
                <input
                  type="text"
                  className={styles['search-input']}
                  placeholder="Search by name, email, ID..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </header>

          {isLoading ? (
            <div className={styles['loading-container']}>
              <div className={styles['loading-spinner']}></div>
              <p>Loading students data...</p>
            </div>
          ) : errorMessage ? (
            <div className={styles['error-container']}>
              <AlertCircle size={24} />
              <p>{errorMessage}</p>
              <button className={styles['retry-btn']} onClick={fetchStudents}>Retry</button>
            </div>
          ) : (
            <div className={styles['students-table-container']}>
              <table className={styles['students-table']}>
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
                        <td className={styles['student-id']}>{student.id}</td>
                        <td className={styles['student-name']}>
                          <div className={styles['name-cell']}>
                            <div className={styles['avatar']}>{student.firstName.charAt(0)}{student.lastName.charAt(0)}</div>
                            <div className={styles['name-text']}>{student.firstName} {student.lastName}</div>
                          </div>
                        </td>
                        <td className={styles['student-email']}>{student.email}</td>
                        <td>{student.phone || "—"}</td>
                        <td>
                          <span className={`${styles['package-badge']} ${student.selectedPackage.toLowerCase() === "none" ? styles['none'] : styles['active']}`}>
                            {student.selectedPackage}
                          </span>
                        </td>
                        <td>
                          <div className={styles['table-actions']}>
                            <button
                              className={styles['view-btn']}
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
                      <td colSpan="6" className={styles['no-results']}>
                        <div className={styles['no-data']}>
                          <Search size={32} />
                          <p>No students found matching your search</p>
                          {searchQuery && (
                            <button className={styles['clear-search']} onClick={() => setSearchQuery("")}>
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