import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../components/Sidebar";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Package.css";

const Package = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  // Fetch packages when the component is loaded
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await axios.get("http://localhost:8081/api/packages");
        setPackages(response.data);
        setLoading(false);
      } catch (error) {
        setError("Error fetching packages.");
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  // Toggle expanded package
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Handle select package
  const handleSelectPackage = (e, packageId) => {
    e.stopPropagation();
    // Add your select package logic here
    console.log(`Selected package: ${packageId}`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-layout">
        {/* Sidebar */}
        <div className="sidebar-wrapper">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="dashboard-content">
          <div className="dashboard-wrapper">
            <div className="dashboard-header">
              <div className="header-content">
                <div className="header-icon">
                  <i className="bi bi-box-seam"></i>
                </div>
                <div className="header-text">
                  <h1 className="page-title">Available Packages</h1>
                  <p className="page-subtitle">Choose the right driving package for you</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {packages.length === 0 && !loading && !error && (
              <div className="empty-packages">
                <div className="empty-icon">
                  <i className="bi bi-box"></i>
                </div>
                <h3 className="empty-title">No packages available</h3>
                <p className="empty-subtitle">Please check back later for available driving packages</p>
              </div>
            )}

            <div className="packages-grid">
              {packages.map((pkg) => (
                <div key={pkg.id} className="dashboard-card package-card">
                  <div className="package-top">
                    <div className="card-header">
                      <h2 className="card-title">
                        <i className="bi bi-box-seam"></i>
                        {pkg.title}
                      </h2>
                      <div className="price-badge">Rs.{pkg.price}</div>
                    </div>

                    <div className="card-body">
                      <div className="package-summary">
                        {pkg.description.substring(0, 80)}...
                      </div>
                      
                      <div 
                        className="view-details-button"
                        onClick={() => toggleExpand(pkg.id)}
                      >
                        <span>{expandedId === pkg.id ? "View less" : "View details"}</span>
                        <i className={`bi ${expandedId === pkg.id ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                      </div>
                    </div>
                  </div>

                  <div className={`package-details ${expandedId === pkg.id ? 'open' : ''}`}>
                    <div className="details-content">
                      <p className="description">{pkg.description}</p>
                      
                      {pkg.details && <p className="details-text">{pkg.details}</p>}
                      
                      {pkg.vehicles && pkg.vehicles.length > 0 && (
                        <div className="vehicles-section">
                          <h3 className="section-title">
                            <i className="bi bi-car-front"></i>
                            Vehicles & Lessons:
                          </h3>
                          <div className="vehicle-list">
                            {pkg.vehicles.map((vehicle, idx) => (
                              <div key={idx} className="vehicle-item">
                                <span className="vehicle-name">{vehicle.name}</span>
                                <span className="vehicle-model">({vehicle.model})</span>
                                <span className="lesson-count">{vehicle.lesson_count} Lessons</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <button 
                        className="confirm-button active"
                        onClick={(e) => handleSelectPackage(e, pkg.id)}
                      >
                        <i className="bi bi-check-circle"></i>
                        Select Package
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Package;