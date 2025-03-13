import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar/Sidebar";
import "./Packages.css";

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [expandedPackage, setExpandedPackage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newPackage, setNewPackage] = useState({
    title: "",
    description: "",
    price: "",
    details: "",
  });

  // Fetch packages from backend on component mount
  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/packages");
      setPackages(response.data);
    } catch (error) {
      console.error("Error fetching packages:", error);
    }
  };

  // Function to toggle expanded state
  const toggleExpand = (id) => {
    setExpandedPackage(expandedPackage === id ? null : id);
  };

  // Function to delete a package
  const deletePackage = async (e, id) => {
    e.stopPropagation();
    try {
      await axios.delete(`http://localhost:8081/api/packages/${id}`);
      fetchPackages(); // Refresh the list after deletion
    } catch (error) {
      console.error("Error deleting package:", error);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPackage({ ...newPackage, [name]: value });
  };

  // Function to add a package
  const handleAddPackage = async () => {
    try {
      await axios.post("http://localhost:8081/api/packages/addPackage", newPackage);
      setShowModal(false);
      setNewPackage({ title: "", description: "", price: "", details: "" });
      fetchPackages(); // Refresh the list after adding
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
                <div className="package-price-tag">${pkg.price}</div>
                <h3>{pkg.title}</h3>
                <p>{pkg.description}</p>

                {expandedPackage === pkg.id && (
                  <div className="package-details">
                    <p>{pkg.details}</p>
                    <div className="package-actions">
                      <button className="book-btn">Book Now</button>
                      <button className="info-btn">More Info</button>
                      <button className="delete-btn" onClick={(e) => deletePackage(e, pkg.id)}>
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
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="add-btn" onClick={handleAddPackage}>
                Add Package
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Packages;
