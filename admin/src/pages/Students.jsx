import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import { 
  Search, 
  Send, 
  Eye, 
  CheckSquare, 
  AlertCircle,
  User 
} from "lucide-react";
import "./Students.css";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [selectAll, setSelectAll] = useState(false);
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
    navigate(`/admin/students/${student.id}`, { state: { student } });
  };

  const handleCheckboxChange = (id) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedStudentIds([]);
    } else {
      const allIds = filteredStudents.map((student) => student.id);
      setSelectedStudentIds(allIds);
    }
    setSelectAll(!selectAll);
  };

  // In Students.jsx
const handleSendNotification = async () => {
  if (selectedStudentIds.length === 0 || !notificationMessage.trim()) {
    alert("Please select students and enter a message.");
    return;
  }

  const token = localStorage.getItem("authToken");

  if (!token) {
    alert("Authentication token not found. Please log in again.");
    return;
  }

  try {
    // Send only studentIds and message
    await axios.post("http://localhost:8081/api/notifications/send", {
      studentIds: selectedStudentIds,
      message: notificationMessage, // Only message is sent here
    }, {
      headers: {
        Authorization: `Bearer ${token}`, // ✅ Include token here!
      },
    });

    // Show success toast
    const toast = document.createElement("div");
    toast.className = "toast-notification success";
    toast.innerHTML = `<CheckSquare size={20} /> Notification sent to ${selectedStudentIds.length} students!`;
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 3000);

    setNotificationMessage("");
    setSelectedStudentIds([]);
    setSelectAll(false);
  } catch (error) {
    console.error("Error sending notifications:", error);
    
    // Show error toast
    const toast = document.createElement("div");
    toast.className = "toast-notification error";
    toast.innerHTML = `<AlertCircle size={20} /> Failed to send notifications.`;
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 3000);
  }
};

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="students-main-content">
        <div className="students-container">
          <header className="students-header">
            <div className="header-title">
              <h1>
                <span className="title-icon">
                  <User size={24} />
                </span>
                Students Management
              </h1>
              <p className="subtitle">
                {filteredStudents.length} {filteredStudents.length === 1 ? "student" : "students"} in database
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

          <div className="notification-panel">
            <div className="notification-stats">
              <div className="stat-card">
                <span className="count">{selectedStudentIds.length}</span>
                <span className="label">Selected</span>
              </div>
              <div className="stat-card total">
                <span className="count">{filteredStudents.length}</span>
                <span className="label">Total Students</span>
              </div>
            </div>
            <div className="notification-compose">
              <textarea
                className="notification-textarea"
                placeholder="Write notification message here..."
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
              />
              <button
                className="send-notification-btn"
                onClick={handleSendNotification}
                disabled={selectedStudentIds.length === 0}
              >
                <Send size={16} />
                <span>Send to {selectedStudentIds.length} {selectedStudentIds.length === 1 ? "Student" : "Students"}</span>
              </button>
            </div>
          </div>

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
                    <th>
                      <div className="checkbox-wrapper">
                        <input
                          type="checkbox"
                          id="select-all"
                          checked={selectAll}
                          onChange={handleSelectAll}
                        />
                        <label htmlFor="select-all" className="checkbox-label"></label>
                      </div>
                    </th>
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
                      <tr key={student.id} className={selectedStudentIds.includes(student.id) ? "selected-row" : ""}>
                        <td>
                          <div className="checkbox-wrapper">
                            <input
                              type="checkbox"
                              id={`student-${student.id}`}
                              checked={selectedStudentIds.includes(student.id)}
                              onChange={() => handleCheckboxChange(student.id)}
                            />
                            <label htmlFor={`student-${student.id}`} className="checkbox-label"></label>
                          </div>
                        </td>
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
                              <span>View</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="no-results">
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

export default Students;