import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../components/Sidebar";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Package.css";

const Package = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPackageId, setSelectedPackageId] = useState(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await axios.get("http://localhost:8081/api/packages");
        // Transform the data to match the frontend structure
        const transformedPackages = response.data.map(pkg => ({
          ...pkg,
          vehicles: [
            { vehicle_id: 1, lesson_count: pkg.bike_sessions },
            { vehicle_id: 2, lesson_count: pkg.tricycle_sessions },
            { vehicle_id: 3, lesson_count: pkg.van_sessions }
          ]
        }));
        setPackages(transformedPackages);
        setLoading(false);
      } catch (error) {
        setError("Error fetching packages.");
        setLoading(false);
      }
    };

    const fetchSelectedPackage = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;
        const response = await axios.get("http://localhost:8081/api/selected-package", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.packageId) {
          setSelectedPackageId(response.data.packageId);
        }
      } catch (err) {
        console.error("Error fetching selected package:", err);
      }
    };

    fetchPackages();
    fetchSelectedPackage();
  }, []);

  const showToast = (message, type) => {
    const toast = document.createElement("div");
    toast.className = `toast-notification ${type}`;
    
    // Create icon element
    const icon = document.createElement("i");
    icon.className = `bi ${type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'}`;
    icon.style.marginRight = "8px";
    
    // Create message text node
    const messageText = document.createTextNode(message);
    
    // Append icon and message to toast
    toast.appendChild(icon);
    toast.appendChild(messageText);
    
    document.body.appendChild(toast);
    
    // Remove toast after animation
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  };

  const handleSelectPackage = async (e, packageId) => {
    e.stopPropagation();
    const token = localStorage.getItem("authToken");

    if (!token) {
      showToast("Please login to select a package.", "error");
      return;
    }

    try {
      await axios.post(
        "http://localhost:8081/api/select-package",
        { packageId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showToast("Package selected successfully!", "success");
      setSelectedPackageId(packageId);
    } catch (error) {
      console.error("Error selecting package:", error);
      showToast(
        error.response?.data?.message || "Failed to select package. Please try again.",
        "error"
      );
    }
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
        <div className="sidebar-wrapper">
          <Sidebar />
        </div>

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
                      <div className="price-badge">Rs. {pkg.price.toLocaleString()}</div>
                    </div>

                    <div className="card-body">
                      <div className="package-summary">
                        {pkg.description}
                      </div>
                    </div>
                  </div>

                  <div className="package-details">
                    <div className="details-content">
                      {pkg.details && (
                        <>
                          <h5>Detailed Information</h5>
                          <p className="details-text">{pkg.details}</p>
                        </>
                      )}
                      
                      <div className="sessions-section">
                        <h4>
                          <i className="bi bi-car-front"></i>
                          Included Training Sessions
                        </h4>
                        <div className="sessions-grid">
                          <div className="session-card bike-session">
                            <div className="session-icon">
                              {/* <i className="bi bi-bicycle"></i> */}
                            </div>
                            <div className="session-info">
                              <div className="session-name">Bike Sessions</div>
                              <div className="session-count">
                                {pkg.bike_sessions} lessons
                              </div>
                            </div>
                          </div>

                          <div className="session-card tricycle-session">
                            <div className="session-icon">
                              {/* <i className="bi bi-tricycle"></i> */}
                            </div>
                            <div className="session-info">
                              <div className="session-name">Tricycle Sessions</div>
                              <div className="session-count">
                                {pkg.tricycle_sessions} lessons
                              </div>
                            </div>
                          </div>

                          <div className="session-card van-session">
                            <div className="session-icon">
                              {/* <i className="bi bi-truck"></i> */}
                            </div>
                            <div className="session-info">
                              <div className="session-name">Van Sessions</div>
                              <div className="session-count">
                                {pkg.van_sessions} lessons
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="package-actions">
                        {selectedPackageId === null ? (
                          <button 
                            className="btn btn-primary select-btn"
                            onClick={(e) => handleSelectPackage(e, pkg.id)}
                          >
                            <i className="bi bi-check-circle"></i> Select Package
                          </button>
                        ) : selectedPackageId === pkg.id ? (
                          <button className="btn btn-success selected-btn" disabled>
                            <i className="bi bi-check2-circle"></i> Selected
                          </button>
                        ) : (
                          <button className="btn btn-secondary disabled-btn" disabled>
                            <i className="bi bi-x-circle"></i> Already Selected Another
                          </button>
                        )}
                      </div>
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