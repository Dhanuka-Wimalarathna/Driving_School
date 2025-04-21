import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import { 
  Search, 
  Eye,
  Plus,
  Trash2,
  AlertCircle,
  Car
} from "lucide-react";
import "./Vehicles.css";

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    name: "",
    model: "",
    plate_number: "",
    type: "",
    status: "Available"
  });
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
    navigate(`/admin/vehicles/${vehicle.id}`, { state: { vehicle } });
  };

  const deleteVehicle = async (id) => {
    try {
      await axios.delete(`http://localhost:8081/api/vehicles/${id}`);
      setVehicles(vehicles.filter((vehicle) => vehicle.id !== id));
      setFilteredVehicles(filteredVehicles.filter((vehicle) => vehicle.id !== id));
    } catch (error) {
      console.error("Error deleting vehicle:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVehicle({ ...newVehicle, [name]: value });
  };

  const handleAddVehicle = async () => {
    if (!newVehicle.name || !newVehicle.plate_number || !newVehicle.type) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      await axios.post("http://localhost:8081/api/vehicles/addVehicle", newVehicle);
      setShowModal(false);
      setNewVehicle({ 
        name: "", 
        model: "", 
        plate_number: "", 
        type: "", 
        status: "Available"
      });
      fetchVehicles();
    } catch (error) {
      console.error("Error adding vehicle:", error);
      alert("Failed to add vehicle. Please try again.");
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
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
                {filteredVehicles.length} {filteredVehicles.length === 1 ? "vehicle" : "vehicles"} in database
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
              <button 
                className="add-vehicle-btn"
                onClick={() => setShowModal(true)}
              >
                <Plus size={16} />
                <span>Add Vehicle</span>
              </button>
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
            <div className="vehicles-table-container">
              <table className="vehicles-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Vehicle</th>
                    <th>Plate Number</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.length > 0 ? (
                    filteredVehicles.map((vehicle) => (
                      <tr key={vehicle.id}>
                        <td className="vehicle-id">{vehicle.id}</td>
                        <td className="vehicle-name">
                          <div className="name-cell">
                            <div className="avatar">{vehicle.name.charAt(0)}{vehicle.model?.charAt(0) || 'V'}</div>
                            <div className="name-text">
                              <div>{vehicle.name}</div>
                              {vehicle.model && <div className="model-text">{vehicle.model}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="vehicle-plate">{vehicle.plate_number}</td>
                        <td className="vehicle-type">{vehicle.type}</td>
                        <td>
                          <span className={`status-badge ${vehicle.status.toLowerCase().replace(/\s+/g, '-')}`}>
                            {vehicle.status}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="view-btn"
                              onClick={() => handleViewClick(vehicle)}
                              title="View vehicle details"
                            >
                              <Eye size={16} />
                              <span>View</span>
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => deleteVehicle(vehicle.id)}
                              title="Delete vehicle"
                            >
                              <Trash2 size={16} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-results">
                        <div className="no-data">
                          <Search size={32} />
                          <p>No vehicles found matching your search</p>
                          {searchQuery && (
                            <button className="clear-search" onClick={() => setSearchQuery("")}>
                              Clear search
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Add Vehicle Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Vehicle</h2>
            
            <div className="form-group">
              <label>Vehicle Name*</label>
              <input 
                type="text" 
                name="name" 
                value={newVehicle.name} 
                onChange={handleInputChange} 
                placeholder="Vanette, TownAce etc" 
                required 
              />
            </div>

            <div className="form-group">
              <label>Vehicle Brand</label>
              <input 
                type="text" 
                name="model" 
                value={newVehicle.model} 
                onChange={handleInputChange} 
                placeholder="Nissan, Toyota etc" 
              />
            </div>

            <div className="form-group">
              <label>Plate Number*</label>
              <input 
                type="text" 
                name="plate_number" 
                value={newVehicle.plate_number} 
                onChange={handleInputChange} 
                placeholder="ABC-1234" 
                required 
              />
            </div>

            <div className="form-group">
              <label>Vehicle Type*</label>
              <select 
                name="type" 
                value={newVehicle.type} 
                onChange={handleInputChange}
                required
              >
                <option value="">Select Type</option>
                <option value="Van">Van</option>
                <option value="Car">Car</option>
                <option value="Three-Wheeler">Three-Wheeler</option>
                <option value="Bike">Bike</option>
              </select>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select 
                name="status" 
                value={newVehicle.status} 
                onChange={handleInputChange}
              >
                <option value="Available">Available</option>
                <option value="In Maintenance">In Maintenance</option>
                <option value="In Use">In Use</option>
                <option value="Out of Service">Out of Service</option>
              </select>
            </div>

            <div className="modal-actions">
              <button 
                className="cancel-btn" 
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button 
                className="add-btn" 
                onClick={handleAddVehicle}
              >
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