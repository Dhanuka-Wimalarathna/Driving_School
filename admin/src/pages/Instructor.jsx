import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar/Sidebar";
import "./Instructor.css";

const Instructor = () => {
  const [instructors, setInstructors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch instructors when component mounts
  useEffect(() => {
    fetchInstructors();
  }, []);

  // Function to fetch instructors from API
  const fetchInstructors = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/instructors");
      const mappedInstructors = response.data.map((instructor) => ({
        id: instructor.ins_id,
        firstName: instructor.firstName,
        lastName: instructor.lastName,
        email: instructor.email,
        phone: instructor.phone,
        licenseNo: instructor.licenseNo,
      }));
      setInstructors(mappedInstructors);
    } catch (error) {
      console.error("Error fetching instructors:", error);
      setInstructors([]);
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
    }
  };

  // Filter instructors based on search query
  const filteredInstructors = instructors.filter((instructor) =>
    `${instructor.firstName} ${instructor.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    instructor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (instructor.phone && instructor.phone.includes(searchQuery))
  );

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <div className="instructors-page">
          <div className="instructors-header">
            <h1>Instructors</h1>
            <input
              type="text"
              className="search-input"
              placeholder="Search instructors..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          <div className="instructor-list">
            {filteredInstructors.length > 0 ? (
              filteredInstructors.map((instructor) => (
                <div key={instructor.id} className="instructor-card">
                  <h3>{instructor.firstName} {instructor.lastName}</h3>
                  <p>Email: {instructor.email}</p>
                  <p>Phone: {instructor.phone}</p>
                  <p>License No: {instructor.licenseNo}</p>
                  <button className="delete-btn" onClick={() => deleteInstructor(instructor.id)}>
                    Delete
                  </button>
                </div>
              ))
            ) : (
              <p className="no-results">No instructors found.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Instructor;
