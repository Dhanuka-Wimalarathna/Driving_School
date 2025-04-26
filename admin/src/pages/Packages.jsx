import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar/Sidebar";
import "./Packages.css";

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [expandedPackage, setExpandedPackage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [newPackage, setNewPackage] = useState({
    title: "",
    description: "",
    price: "",
    details: "",
    bikeSessionAmount: "",
    tricycleSessionAmount: "",
    vanSessionAmount: "",
  });
  const [inputErrors, setInputErrors] = useState({
    price: false,
    bikeSessionAmount: false,
    tricycleSessionAmount: false,
    vanSessionAmount: false,
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/packages");
      // Map vehicles array into flat fields for each package
      const packagesWithSessions = response.data.map(pkg => {
        let bikeSessionAmount = "";
        let tricycleSessionAmount = "";
        let vanSessionAmount = "";
  
        if (pkg.vehicles && Array.isArray(pkg.vehicles)) {
          pkg.vehicles.forEach(vehicle => {
            if (vehicle.vehicle_id === 1) bikeSessionAmount = vehicle.lesson_count;
            if (vehicle.vehicle_id === 2) tricycleSessionAmount = vehicle.lesson_count;
            if (vehicle.vehicle_id === 3) vanSessionAmount = vehicle.lesson_count;
          });
        }
  
        return {
          ...pkg,
          bikeSessionAmount,
          tricycleSessionAmount,
          vanSessionAmount
        };
      });
      setPackages(packagesWithSessions);
    } catch (error) {
      console.error("Error fetching packages:", error);
    }
  };  

  const toggleExpand = (id) => {
    setExpandedPackage(expandedPackage === id ? null : id);
  };

  const deletePackage = async (e, id) => {
    e.stopPropagation();
    try {
      await axios.delete(`http://localhost:8081/api/packages/${id}`);
      fetchPackages();
    } catch (error) {
      console.error("Error deleting package:", error);
    }
  };

  const validateNumberInput = (name, value) => {
    // Allow empty values
    if (value === "") return true;
    
    // Check if input is a valid number
    const numberRegex = /^[0-9]+(\.[0-9]{1,2})?$/;
    return numberRegex.test(value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // For numeric fields, validate input
    if (["price", "bikeSessionAmount", "tricycleSessionAmount", "vanSessionAmount"].includes(name)) {
      const isValid = validateNumberInput(name, value);
      
      setInputErrors({
        ...inputErrors,
        [name]: !isValid
      });
      
      // Only update state if input is valid or empty
      if (isValid) {
        if (editingPackage) {
          setEditingPackage({ ...editingPackage, [name]: value });
        } else {
          setNewPackage({ ...newPackage, [name]: value });
        }
      }
    } else {
      // For non-numeric fields, update normally
      if (editingPackage) {
        setEditingPackage({ ...editingPackage, [name]: value });
      } else {
        setNewPackage({ ...newPackage, [name]: value });
      }
    }
  };

  const validateForm = () => {
    // Check if there are any validation errors
    return !Object.values(inputErrors).some(error => error);
  };

  const handleSavePackage = async () => {
    // Validate form before submitting
    if (!validateForm()) {
      alert("Please correct the errors in the form before submitting.");
      return;
    }

    try {
      if (editingPackage) {
        await axios.put(`http://localhost:8081/api/packages/${editingPackage.id}`, editingPackage);
      } else {
        await axios.post("http://localhost:8081/api/packages/addPackage", newPackage);
      }

      setShowModal(false);
      setEditingPackage(null);
      setNewPackage({
        title: "",
        description: "",
        price: "",
        details: "",
        bikeSessionAmount: "",
        tricycleSessionAmount: "",
        vanSessionAmount: "",
      });
      setInputErrors({
        price: false,
        bikeSessionAmount: false,
        tricycleSessionAmount: false,
        vanSessionAmount: false,
      });
      fetchPackages();
    } catch (error) {
      console.error("Error saving package:", error);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <div className="packages-page">
          <div className="packages-header">
            <div className="header-content">
              <h1>Packages</h1>
              <p className="header-subtitle">Manage your service packages</p>
            </div>
            <button
              className="add-package-btn"
              onClick={() => {
                setEditingPackage(null);
                setInputErrors({
                  price: false,
                  bikeSessionAmount: false,
                  tricycleSessionAmount: false,
                  vanSessionAmount: false,
                });
                setShowModal(true);
              }}
            >
              <span className="btn-icon">+</span> Add New Package
            </button>
          </div>

          <div className="package-list">
            {packages.length === 0 ? (
              <div className="no-packages">
                <div className="empty-state">
                  <svg className="empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 12V8H4V12M20 12V20H4V12M20 12H4M8 8V4H16V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <h3>No Packages Found</h3>
                  <p>Create your first package to get started</p>
                </div>
              </div>
            ) : (
              packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`package-card ${expandedPackage === pkg.id ? "expanded" : ""}`}
                  onClick={() => toggleExpand(pkg.id)}
                >
                  <div className="package-price-tag">Rs.{pkg.price}</div>
                  <div className="package-header">
                    <h3>{pkg.title}</h3>
                  </div>
                  <p className="package-description">{pkg.description}</p>
                  
                  {expandedPackage === pkg.id && (
                    <div className="package-details">
                      <div className="details-section">
                        <h4>Package Details</h4>
                        <p>{pkg.details}</p>
                      </div>
                      
                      <div className="details-section">
                        <h4>Session Information</h4>
                        <div className="session-grid">
                          <div className="session-item">
                            <div className="session-icon bike-icon">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 19C7.20914 19 9 17.2091 9 15C9 12.7909 7.20914 11 5 11C2.79086 11 1 12.7909 1 15C1 17.2091 2.79086 19 5 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M19 19C21.2091 19 23 17.2091 23 15C23 12.7909 21.2091 11 19 11C16.7909 11 15 12.7909 15 15C15 17.2091 16.7909 19 19 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M5 11V7L12 9L19 11M12 9V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <div className="session-info">
                              <span className="session-label">Bike Sessions</span>
                              <span className="session-value">{pkg.bikeSessionAmount || "N/A"}</span>
                            </div>
                          </div>
                          <div className="session-item">
                            <div className="session-icon tricycle-icon">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 19C7.20914 19 9 17.2091 9 15C9 12.7909 7.20914 11 5 11C2.79086 11 1 12.7909 1 15C1 17.2091 2.79086 19 5 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M19 19C21.2091 19 23 17.2091 23 15C23 12.7909 21.2091 11 19 11C16.7909 11 15 12.7909 15 15C15 17.2091 16.7909 19 19 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M5 11V7L12 9L19 11M12 9V15M7 4H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <div className="session-info">
                              <span className="session-label">Tricycle Sessions</span>
                              <span className="session-value">{pkg.tricycleSessionAmount || "N/A"}</span>
                            </div>
                          </div>
                          <div className="session-item">
                            <div className="session-icon van-icon">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 6H17L21 12V18H17M3 6V18H6M3 6L1 12H3M6 18C6 19.1046 5.10457 20 4 20C2.89543 20 2 19.1046 2 18C2 16.8954 2.89543 16 4 16C5.10457 16 6 16.8954 6 18ZM17 18C17 19.1046 16.1046 20 15 20C13.8954 20 13 19.1046 13 18C13 16.8954 13.8954 16 15 16C16.1046 16 17 16.8954 17 18Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <div className="session-info">
                              <span className="session-label">Van Sessions</span>
                              <span className="session-value">{pkg.vanSessionAmount || "N/A"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="package-actions">
                        <button
                          className="edit-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPackage(pkg);
                            setInputErrors({
                              price: false,
                              bikeSessionAmount: false,
                              tricycleSessionAmount: false,
                              vanSessionAmount: false,
                            });
                            setShowModal(true);
                          }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={(e) => deletePackage(e, pkg.id)}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingPackage ? "Edit Package" : "Add New Package"}</h2>
              <button className="close-modal-btn" onClick={() => setShowModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            <div className="form-container">
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  value={editingPackage ? editingPackage.title : newPackage.title}
                  onChange={handleInputChange}
                  placeholder="Package Title"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <input
                  id="description"
                  type="text"
                  name="description"
                  value={editingPackage ? editingPackage.description : newPackage.description}
                  onChange={handleInputChange}
                  placeholder="Short description"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="price">Price (Rs)</label>
                <input
                  id="price"
                  type="text"
                  name="price"
                  value={editingPackage ? editingPackage.price : newPackage.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className={inputErrors.price ? "input-error" : ""}
                  required
                />
                {inputErrors.price && <div className="error-message">Please enter a valid number</div>}
              </div>
              <div className="form-group">
                <label htmlFor="details">Details</label>
                <textarea
                  id="details"
                  name="details"
                  value={editingPackage ? editingPackage.details : newPackage.details}
                  onChange={handleInputChange}
                  placeholder="Detailed description of the package"
                  required
                ></textarea>
              </div>
              
              <div className="session-form-section">
                <h3>Session Information</h3>
                <div className="session-form-grid">
                  <div className="form-group">
                    <label htmlFor="bikeSessionAmount">
                      <span className="vehicle-icon">🚲</span> Bike Sessions
                    </label>
                    <input
                      id="bikeSessionAmount"
                      type="text"
                      name="bikeSessionAmount"
                      value={editingPackage ? editingPackage.bikeSessionAmount : newPackage.bikeSessionAmount}
                      onChange={handleInputChange}
                      placeholder="Enter number"
                      className={inputErrors.bikeSessionAmount ? "input-error" : ""}
                    />
                    {inputErrors.bikeSessionAmount && <div className="error-message">Please enter a valid number</div>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="tricycleSessionAmount">
                      <span className="vehicle-icon">🛴</span> Tricycle Sessions
                    </label>
                    <input
                      id="tricycleSessionAmount"
                      type="text"
                      name="tricycleSessionAmount"
                      value={editingPackage ? editingPackage.tricycleSessionAmount : newPackage.tricycleSessionAmount}
                      onChange={handleInputChange}
                      placeholder="Enter number"
                      className={inputErrors.tricycleSessionAmount ? "input-error" : ""}
                    />
                    {inputErrors.tricycleSessionAmount && <div className="error-message">Please enter a valid number</div>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="vanSessionAmount">
                      <span className="vehicle-icon">🚐</span> Van Sessions
                    </label>
                    <input
                      id="vanSessionAmount"
                      type="text"
                      name="vanSessionAmount"
                      value={editingPackage ? editingPackage.vanSessionAmount : newPackage.vanSessionAmount}
                      onChange={handleInputChange}
                      placeholder="Enter number"
                      className={inputErrors.vanSessionAmount ? "input-error" : ""}
                    />
                    {inputErrors.vanSessionAmount && <div className="error-message">Please enter a valid number</div>}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowModal(false);
                  setEditingPackage(null);
                  setInputErrors({
                    price: false,
                    bikeSessionAmount: false,
                    tricycleSessionAmount: false,
                    vanSessionAmount: false,
                  });
                }}
              >
                Cancel
              </button>
              <button className="save-btn" onClick={handleSavePackage}>
                {editingPackage ? "Update Package" : "Create Package"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Packages;