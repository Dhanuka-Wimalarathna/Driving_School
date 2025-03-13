import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar/Sidebar";
import "./Vehicles.css";

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [expandedVehicle, setExpandedVehicle] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    name: "",
    model: "",
    plate_number: "",
    type: "",
    status: "Available",
  });

  // Fetch vehicles from backend on component mount
  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/vehicles");
      setVehicles(response.data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setVehicles([]);
    }
  };

  // Function to toggle expanded state
  const toggleExpand = (id) => {
    setExpandedVehicle(expandedVehicle === id ? null : id);
  };

  // Function to delete a vehicle
  const deleteVehicle = async (e, id) => {
    e.stopPropagation();
    try {
      await axios.delete(`http://localhost:8081/api/vehicles/${id}`);
      fetchVehicles(); // Refresh the list after deletion
    } catch (error) {
      console.error("Error deleting vehicle:", error);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVehicle({ ...newVehicle, [name]: value });
  };

  // Function to add a vehicle
  const handleAddVehicle = async () => {
    try {
      await axios.post("http://localhost:8081/api/vehicles/addVehicle", newVehicle);
      setShowModal(false);
      setNewVehicle({ name: "", model: "", plate_number: "", type: "", status: "Available",});
      fetchVehicles(); // Refresh the list after adding
    } catch (error) {
      console.error("Error adding vehicle:", error);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="main-content">
        <div className="vehicles-page">
          <div className="vehicles-header">
            <h1>Vehicles</h1>
            <button className="add-vehicle-btn" onClick={() => setShowModal(true)}>
              <span className="btn-icon">+</span> Add New Vehicle
            </button>
          </div>

          <div className="vehicle-list">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className={`vehicle-card ${expandedVehicle === vehicle.id ? "expanded" : ""} status-${vehicle.status.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => toggleExpand(vehicle.id)}
              >
                <div className="vehicle-status-tag">{vehicle.status}</div>
                <div className="vehicle-info">
                  <h3>{vehicle.name} {vehicle.model}</h3>
                  <p className="vehicle-plate">Plate: {vehicle.plate_number}</p>
                  <p className="vehicle-type">Type: {vehicle.type}</p>
                </div>

                {expandedVehicle === vehicle.id && (
                  <div className="vehicle-details">
                    <div className="vehicle-actions">
                      <button className="assign-btn">Assign</button>
                      <button className="service-btn">Service History</button>
                      <button className="delete-btn" onClick={(e) => deleteVehicle(e, vehicle.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Add Vehicle Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Vehicle</h2>
            
            <div className="form-group">
              <label>Vehicle Name</label>
              <input type="text" name="name" value={newVehicle.name} onChange={handleInputChange} placeholder="Vanette, TownAce etc" />
            </div>

            <div className="form-group">
              <label>Vehicle Brand</label>
              <input type="text" name="model" value={newVehicle.model} onChange={handleInputChange} placeholder="Nissan, Toyota etc" />
            </div>

            <div className="form-group">
              <label>Plate Number</label>
              <input type="text" name="plate_number" value={newVehicle.plate_number} onChange={handleInputChange} placeholder="ABC-1234" />
            </div>

            <div className="form-group">
              <label>Vehicle Type</label>
              <select name="type" value={newVehicle.type} onChange={handleInputChange}>
                <option value="">Select Type</option>
                <option value="Van">Van</option>
                <option value="Car">Car</option>
                <option value="Three-Wheeler">Three-Wheeler</option>
                <option value="Bike">Bike</option>
              </select>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select name="status" value={newVehicle.status} onChange={handleInputChange}>
                <option value="Available">Available</option>
                <option value="In Maintenance">In Maintenance</option>
                <option value="In Use">In Use</option>
                <option value="Out of Service">Out of Service</option>
              </select>
            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="add-btn" onClick={handleAddVehicle}>
                Add Vehicle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicles;
