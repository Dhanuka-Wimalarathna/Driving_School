import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../components/Sidebar"; // Adjust the import as necessary
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

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <h1>Available Packages</h1>
        
        {loading && <div className="loading-message">Loading packages...</div>}
        
        {error && <div className="error-message">{error}</div>}
        
        {packages.length === 0 && !loading && !error && (
          <div className="no-packages">No packages available.</div>
        )}
        
        <div className="package-grid">
          {packages.map((pkg) => (
            <div key={pkg.id} className="package-card">
              <div 
                className="package-header" 
                onClick={() => toggleExpand(pkg.id)}
              >
                <h2>{pkg.title}</h2>
                <div className="price-tag">Rs.{pkg.price}</div>
              </div>
              
              <div className="summary-text">{pkg.description.substring(0, 80)}...</div>
              
              <div 
                className="expand-indicator" 
                onClick={() => toggleExpand(pkg.id)}
              >
                <span>{expandedId === pkg.id ? "View less" : "View details"}</span>
                <span className={`expand-icon ${expandedId === pkg.id ? 'open' : ''}`}>▼</span>
              </div>
              
              <div className={`package-details ${expandedId === pkg.id ? 'open' : ''}`}>
                <p className="description">{pkg.description}</p>
                
                {pkg.details && <p className="details">{pkg.details}</p>}
                
                {pkg.vehicles && pkg.vehicles.length > 0 && (
                  <div className="vehicles-section">
                    <h3>Vehicles & Lessons:</h3>
                    <ul className="vehicle-list">
                      {pkg.vehicles.map((vehicle, idx) => (
                        <li key={idx} className="vehicle-item">
                          {vehicle.name} ({vehicle.model}) - {vehicle.lesson_count} Lessons
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <button 
                  className="select-btn"
                  onClick={(e) => handleSelectPackage(e, pkg.id)}
                >
                  Select Package
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Package;