import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import InstructorSidebar from '../../../components/Sidebar/InstructorSidebar';import { 
  Search, 
  Eye,
  AlertCircle,
  Car
} from "lucide-react";
import "./InstructorVehicles.module.css";

const InstructorVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredVehicles(vehicles);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = vehicles.filter(
        (vehicle) =>
          vehicle.name.toLowerCase().includes(query) ||
          (vehicle.model && vehicle.model.toLowerCase().includes(query)) ||
          vehicle.plate_number.toLowerCase().includes(query) ||
          vehicle.type.toLowerCase().includes(query) ||
          vehicle.status.toLowerCase().includes(query)
      );
      setFilteredVehicles(filtered);
    }
  }, [searchQuery, vehicles]);

  const fetchVehicles = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await axios.get("http://localhost:8081/api/vehicles");
      setVehicles(response.data);
      setFilteredVehicles(response.data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setErrorMessage("Failed to load vehicle data. Please try again later.");
      setVehicles([]);
      setFilteredVehicles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleViewClick = (vehicle) => {
    navigate(`/instructor/vehicles/${vehicle.id}`, { state: { vehicle } });
  };

  return (
    <div className="dashboard-layout">
      <InstructorSidebar />
      <main className="vehicles-main-content">
        <div className="vehicles-container">
          <header className="vehicles-header">
            <div className="header-title">
              <h1>
                <span className="title-icon">
                  <Car size={24} />
                </span>
                Vehicles
              </h1>
              <p className="subtitle">
                {filteredVehicles.length} {filteredVehicles.length === 1 ? "vehicle" : "vehicles"} assigned to you
              </p>
            </div>
            
            <div className="search-wrapper">
              <div className="search-container">
                <Search className="search-icon" size={18} />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by name, plate, type..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </header>

          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading vehicles data...</p>
            </div>
          ) : errorMessage ? (
            <div className="error-container">
              <AlertCircle size={24} />
              <p>{errorMessage}</p>
              <button className="retry-btn" onClick={fetchVehicles}>Retry</button>
            </div>
          ) : (
            <>
              {filteredVehicles.length > 0 ? (
                <div className="vehicle-cards-container">
                  {filteredVehicles.map((vehicle) => (
                    <div key={vehicle.id} className="vehicle-card" onClick={() => handleViewClick(vehicle)}>
                      <div className="vehicle-image">
                        {vehicle.image_url ? (
                          <img src={vehicle.image_url} alt={vehicle.name} />
                        ) : (
                          <div className="vehicle-avatar">
                            {vehicle.name.charAt(0)}{vehicle.model?.charAt(0) || 'V'}
                          </div>
                        )}
                      </div>
                      <div className="vehicle-details">
                        <h3 className="vehicle-name">{vehicle.name}</h3>
                        {vehicle.model && <p className="vehicle-model">{vehicle.model}</p>}
                        <div className="vehicle-info">
                          <span className="info-label">Plate:</span>
                          <span className="info-value">{vehicle.plate_number}</span>
                        </div>
                        <div className="vehicle-info">
                          <span className="info-label">Type:</span>
                          <span className="info-value">{vehicle.type}</span>
                        </div>
                        <div className="vehicle-status">
                          <span className={`status-badge ${vehicle.status.toLowerCase().replace(/\s+/g, '-')}`}>
                            {vehicle.status}
                          </span>
                        </div>
                        <button className="view-details-btn">
                          <Eye size={16} />
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-vehicles-container">
                  <div className="no-data">
                    <Car size={64} />
                    <h3>No Vehicles Found</h3>
                    <p>
                      {searchQuery
                        ? "No vehicles matching your search criteria"
                        : "You don't have any vehicles assigned to you yet"}
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

export default InstructorVehicles;