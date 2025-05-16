import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { Search, User, Mail, Phone, Trash2, UserCheck, AlertCircle } from "lucide-react";
import "./Instructor.module.css";

const Instructor = () => {
  const [instructors, setInstructors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Fetch instructors when component mounts
  useEffect(() => {
    fetchInstructors();
  }, []);

  // Function to fetch instructors from API
  const fetchInstructors = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await axios.get("http://localhost:8081/api/instructors");
      const mappedInstructors = response.data.map((instructor) => ({
        id: instructor.ins_id,
        firstName: instructor.firstName,
        lastName: instructor.lastName,
        email: instructor.email,
        phone: instructor.phone || "Not provided",
        licenseNo: instructor.licenseNo || "Not provided",
      }));
      setInstructors(mappedInstructors);
    } catch (error) {
      console.error("Error fetching instructors:", error);
      setErrorMessage("Failed to load instructor data. Please try again later.");
      setInstructors([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle search input changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Function to delete an instructor
  const deleteInstructor = async (id) => {
    try {
      await axios.delete(`http://localhost:8081/api/instructors/${id}`);
      setInstructors(instructors.filter((instructor) => instructor.id !== id));
    } catch (error) {
      console.error("Error deleting instructor:", error);
      alert("Failed to delete instructor. Please try again.");
    }
  };

  // Filter instructors based on search query
  const filteredInstructors = instructors.filter((instructor) =>
    `${instructor.firstName} ${instructor.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    instructor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (instructor.phone && instructor.phone.includes(searchQuery))
  );

  // View instructor details
  const handleViewInstructor = (instructor) => {
    navigate(`/instructors/${instructor.id}`, { state: { instructor } });
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="instructors-main-content">
        <div className="instructors-container">
          <header className="instructors-header">
            <div className="header-title">
              <h1>
                <span className="title-icon">
                  <UserCheck size={24} />
                </span>
                Instructors
              </h1>
              <p className="subtitle">
                {filteredInstructors.length} {filteredInstructors.length === 1 ? "instructor" : "instructors"} registered
              </p>
            </div>
            
            <div className="search-wrapper">
              <div className="search-container">
                <Search className="search-icon" size={18} />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by name, email, phone..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </header>

          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading instructors data...</p>
            </div>
          ) : errorMessage ? (
            <div className="error-container">
              <AlertCircle size={24} />
              <p>{errorMessage}</p>
              <button className="retry-btn" onClick={fetchInstructors}>Retry</button>
            </div>
          ) : (
            <>
              {filteredInstructors.length > 0 ? (
                <div className="instructor-cards-container">
                  {filteredInstructors.map((instructor) => (
                    <div key={instructor.id} className="instructor-card">
                      <div className="instructor-avatar">
                        {instructor.firstName.charAt(0)}{instructor.lastName.charAt(0)}
                      </div>
                      <div className="instructor-details">
                        <h3 className="instructor-name">{instructor.firstName} {instructor.lastName}</h3>
                        
                        <div className="instructor-info">
                          <Mail size={16} className="info-icon" />
                          <span className="info-text">{instructor.email}</span>
                        </div>
                        
                        <div className="instructor-info">
                          <Phone size={16} className="info-icon" />
                          <span className="info-text">{instructor.phone}</span>
                        </div>
                        
                        <div className="instructor-info">
                          <User size={16} className="info-icon" />
                          <span className="info-text">License: {instructor.licenseNo}</span>
                        </div>
                        
                        <div className="instructor-actions">
                          <button 
                            className="view-btn"
                            onClick={() => handleViewInstructor(instructor)}
                          >
                            View Details
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => deleteInstructor(instructor.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-instructors-container">
                  <div className="no-data">
                    <UserCheck size={64} />
                    <h3>No Instructors Found</h3>
                    <p>
                      {searchQuery
                        ? "No instructors matching your search criteria"
                        : "There are no instructors registered in the system yet"}
                    </p>
                    {searchQuery && (
                      <button className="clear-search" onClick={() => setSearchQuery("")}>
                        Clear search
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Instructor;