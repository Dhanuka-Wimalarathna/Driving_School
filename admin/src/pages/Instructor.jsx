import React, { useState } from "react";
import "./Instructor.css";
import Sidebar from "../components/Sidebar/Sidebar";

const Instructor = () => {
  const [instructors, setInstructors] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "123-456-7890",
      specialization: "Driving Basics",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "987-654-3210",
      specialization: "Advanced Driving",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newInstructor, setNewInstructor] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewInstructor({ ...newInstructor, [name]: value });
  };

  // Function to add a new instructor
  const handleAddInstructor = () => {
    const newId = instructors.length + 1;
    const instructor = { id: newId, ...newInstructor };
    setInstructors([...instructors, instructor]);
    setShowModal(false);
    setNewInstructor({ name: "", email: "", phone: "", specialization: "" });
  };

  // Function to delete an instructor
  const deleteInstructor = (id) => {
    setInstructors(instructors.filter((instructor) => instructor.id !== id));
  };

  return (
    <div className="dashboard-layout">
        <Sidebar />
        
      <main className="main-content">
        <div className="instructors-page">
          <div className="instructors-header">
            <h1>Instructors</h1>
            <button className="add-instructor-btn" onClick={() => setShowModal(true)}>
              <span className="btn-icon">+</span> Add New Instructor
            </button>
          </div>

          <div className="instructor-list">
            {instructors.map((instructor) => (
              <div key={instructor.id} className="instructor-card">
                <h3>{instructor.name}</h3>
                <p>Email: {instructor.email}</p>
                <p>Phone: {instructor.phone}</p>
                <p>Specialization: {instructor.specialization}</p>
                <button
                  className="delete-btn"
                  onClick={() => deleteInstructor(instructor.id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Add Instructor Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Instructor</h2>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={newInstructor.name}
                onChange={handleInputChange}
                placeholder="Instructor Name"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={newInstructor.email}
                onChange={handleInputChange}
                placeholder="Instructor Email"
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="text"
                name="phone"
                value={newInstructor.phone}
                onChange={handleInputChange}
                placeholder="Instructor Phone"
              />
            </div>
            <div className="form-group">
              <label>Specialization</label>
              <input
                type="text"
                name="specialization"
                value={newInstructor.specialization}
                onChange={handleInputChange}
                placeholder="Instructor Specialization"
              />
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="add-btn" onClick={handleAddInstructor}>
                Add Instructor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Instructor;