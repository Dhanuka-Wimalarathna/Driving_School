import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar/Sidebar";
import "./Packages.css";

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [vehicles, setVehicles] = useState([]); // Store available vehicles
  const [expandedPackage, setExpandedPackage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newPackage, setNewPackage] = useState({
    title: "",
    description: "",
    price: "",
    details: "",
    vehicles: [], // Store selected vehicles with lesson counts
  });

  // Fetch packages and vehicles when component loads
  useEffect(() => {
    fetchPackages();
    fetchVehicles();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/packages");
      setPackages(response.data);
    } catch (error) {
      console.error("Error fetching packages:", error);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/vehicles");
      setVehicles(response.data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  // Toggle expanded package
  const toggleExpand = (id) => {
    setExpandedPackage(expandedPackage === id ? null : id);
  };

  // Delete package
  const deletePackage = async (e, id) => {
    e.stopPropagation();
    try {
      await axios.delete(`http://localhost:8081/api/packages/${id}`);
      fetchPackages(); // Refresh list after deletion
    } catch (error) {
      console.error("Error deleting package:", error);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPackage({ ...newPackage, [name]: value });
  };

  // Handle vehicle selection and lesson count input
  const handleVehicleChange = (vehicleId, lessonCount) => {
    setNewPackage((prevPackage) => {
      const updatedVehicles = prevPackage.vehicles.filter(v => v.vehicle_id !== vehicleId);
      if (lessonCount > 0) {
        updatedVehicles.push({ vehicle_id: vehicleId, lesson_count: lessonCount });
      }
      return { ...prevPackage, vehicles: updatedVehicles };
    });
  };

  // Add new package with vehicles
  const handleAddPackage = async () => {
    try {
      await axios.post("http://localhost:8081/api/packages/addPackage", newPackage);
      setShowModal(false);
      setNewPackage({ title: "", description: "", price: "", details: "", vehicles: [] });
      fetchPackages(); 
    } catch (error) {
      console.error("Error adding package:", error);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <div className="packages-page">
          <div className="packages-header">
            <h1>Packages</h1>
            <button className="add-package-btn" onClick={() => setShowModal(true)}>
              <span className="btn-icon">+</span> Add New Package
            </button>
          </div>

          <div className="package-list">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`package-card ${expandedPackage === pkg.id ? "expanded" : ""}`}
                onClick={() => toggleExpand(pkg.id)}
              >
                <div className="package-price-tag">Rs.{pkg.price}</div>
                <h3>{pkg.title}</h3>
                <p>{pkg.description}</p>

                {expandedPackage === pkg.id && (
                  <div className="package-details">
                    <p>{pkg.details}</p>
                    <h4>Vehicles & Lessons:</h4>
                    {pkg.vehicles && pkg.vehicles.length > 0 ? (
                      <ul>
                        {pkg.vehicles.map((vehicle) => (
                          <li key={vehicle.vehicle_id}>
                            {vehicle.name} ({vehicle.model}) - {vehicle.lesson_count} Lessons
                            </li>
                          ))}
                          </ul>
                          ) : (
                          <p>No vehicles assigned.</p>
                          )}
                          <div className="package-actions">
                            <button className="book-btn">Edit Package</button>
                            <button className="delete-btn" onClick={(e) => deletePackage(e, pkg.id)}>Delete</button>
                            </div>
                          </div>
                        )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Add Package Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Package</h2>
            <div className="form-group">
              <label>Title</label>
              <input type="text" name="title" value={newPackage.title} onChange={handleInputChange} placeholder="Package Title" />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input type="text" name="description" value={newPackage.description} onChange={handleInputChange} placeholder="Short description" />
            </div>
            <div className="form-group">
              <label>Price</label>
              <input type="text" name="price" value={newPackage.price} onChange={handleInputChange} placeholder="Rs.0" />
            </div>
            <div className="form-group">
              <label>Details</label>
              <textarea name="details" value={newPackage.details} onChange={handleInputChange} placeholder="Detailed description"></textarea>
            </div>

            <h3>Select Vehicles & Lessons</h3>
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="vehicle-selection">
                <span>{vehicle.name} ({vehicle.model})</span>
                <input
                  type="number"
                  min="0"
                  placeholder="Lessons"
                  onChange={(e) => handleVehicleChange(vehicle.id, parseInt(e.target.value, 10) || 0)}
                />
              </div>
            ))}

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="add-btn" onClick={handleAddPackage}>Add Package</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Packages;
