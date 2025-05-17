import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { 
  Search, 
  Edit,
  Plus,
  Trash2,
  AlertCircle,
  Car
} from "lucide-react";
import styles from './Vehicles.module.css';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState(null);
  const [newVehicle, setNewVehicle] = useState({
    name: "",
    model: "",
    plate_number: "",
    type: "",
    status: "Available"
  });
  const [newStatus, setNewStatus] = useState("Available");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Vehicle types and statuses from database schema
  const vehicleTypes = ['Van', 'Car', 'Three-Wheeler', 'Bike'];
  const vehicleStatuses = ['Available', 'Unavailable', 'In Service'];

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
      setErrorMessage(error.response?.data?.message || "Failed to load vehicle data. Please try again later.");
      setVehicles([]);
      setFilteredVehicles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleEditStatusClick = (vehicle) => {
    setCurrentVehicle(vehicle);
    setNewStatus(vehicle.status);
    setShowStatusModal(true);
  };

  const handleStatusChange = async () => {
    if (!currentVehicle) return;

    try {
      const response = await axios.put(
        `http://localhost:8081/api/vehicles/${currentVehicle.id}/status`,
        { status: newStatus }
      );

      // Update the vehicle in state
      setVehicles(vehicles.map(v => 
        v.id === currentVehicle.id ? { ...v, status: newStatus } : v
      ));
      setFilteredVehicles(filteredVehicles.map(v => 
        v.id === currentVehicle.id ? { ...v, status: newStatus } : v
      ));

      setShowStatusModal(false);
      setCurrentVehicle(null);
    } catch (error) {
      console.error("Error updating vehicle status:", error);
      alert(error.response?.data?.message || "Failed to update vehicle status. Please try again.");
    }
  };

  const deleteVehicle = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;
    
    try {
      await axios.delete(`http://localhost:8081/api/vehicles/${id}`);
      setVehicles(vehicles.filter(v => v.id !== id));
      setFilteredVehicles(filteredVehicles.filter(v => v.id !== id));
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      alert(error.response?.data?.message || "Failed to delete vehicle. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVehicle(prev => ({ ...prev, [name]: value }));
  };

  const handleAddVehicle = async () => {
    if (!newVehicle.name || !newVehicle.plate_number || !newVehicle.type) {
      alert("Please fill in all required fields (Name, Plate Number, and Type)");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8081/api/vehicles/addVehicle", 
        newVehicle
      );
      
      // Add the new vehicle to the list
      setVehicles(prev => [...prev, response.data.vehicle]);
      setFilteredVehicles(prev => [...prev, response.data.vehicle]);
      
      // Reset form and close modal
      setNewVehicle({ 
        name: "", 
        model: "", 
        plate_number: "", 
        type: "", 
        status: "Available"
      });
      setShowModal(false);
    } catch (error) {
      console.error("Error adding vehicle:", error);
      alert(error.response?.data?.message || "Failed to add vehicle. Please try again.");
    }
  };

  const getVehicleIcon = (type) => {
    switch(type) {
      case 'Van': return <i className="bi bi-truck"></i>;
      case 'Car': return <i className="bi bi-car-front"></i>;
      case 'Three-Wheeler': return <i className="bi bi-tricycle"></i>;
      case 'Bike': return <i className="bi bi-bicycle"></i>;
      default: return <i className="bi bi-question-circle"></i>;
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className={styles['dashboard-layout']}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <main className={styles['vehicles-main-content']}>
        <div className={styles['vehicles-container']}>
          <header className={styles['vehicles-header']}>
            <div className={styles['header-title']}>
              <h1>
                <span className={styles['title-icon']}>
                  <Car size={24} />
                </span>
                Vehicles
              </h1>
              <p className={styles['subtitle']}>
                {filteredVehicles.length} {filteredVehicles.length === 1 ? "vehicle" : "vehicles"} in database
              </p>
            </div>
            
            <div className={styles['search-wrapper']}>
              <div className={styles['search-container']}>
                <Search className={styles['search-icon']} size={18} />
                <input
                  type="text"
                  className={styles['search-input']}
                  placeholder="Search by name, plate, type..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              <button 
                className={styles['add-vehicle-btn']}
                onClick={() => setShowModal(true)}
              >
                <Plus size={16} />
                <span>Add Vehicle</span>
              </button>
            </div>
          </header>

          {isLoading ? (
            <div className={styles['loading-container']}>
              <div className={styles['loading-spinner']}></div>
              <p>Loading vehicles data...</p>
            </div>
          ) : errorMessage ? (
            <div className={styles['error-container']}>
              <AlertCircle size={24} />
              <p>{errorMessage}</p>
              <button className={styles['retry-btn']} onClick={fetchVehicles}>Retry</button>
            </div>
          ) : (
            <>
              {filteredVehicles.length > 0 ? (
                <div className={styles['vehicle-cards-container']}>
                  {filteredVehicles.map((vehicle) => (
                    <div key={vehicle.id} className={styles['vehicle-card']}>
                      <div className={styles['vehicle-image']}>
                        <div className={styles['vehicle-type-icon']}>
                          {getVehicleIcon(vehicle.type)}
                        </div>
                      </div>
                      <div className={styles['vehicle-details']}>
                        <h3 className={styles['vehicle-name']}>{vehicle.name}</h3>
                        {vehicle.model && <p className={styles['vehicle-model']}>{vehicle.model}</p>}
                        <div className={styles['vehicle-info']}>
                          <span className={styles['info-label']}>ID:</span>
                          <span className={styles['info-value']}>{vehicle.id}</span>
                        </div>
                        <div className={styles['vehicle-info']}>
                          <span className={styles['info-label']}>Plate:</span>
                          <span className={styles['info-value']}>{vehicle.plate_number}</span>
                        </div>
                        <div className={styles['vehicle-info']}>
                          <span className={styles['info-label']}>Type:</span>
                          <span className={styles['info-value']}>{vehicle.type}</span>
                        </div>
                        <div className={styles['vehicle-status']}>
                          <span 
                            className={`${styles['status-badge']} ${styles[vehicle.status.toLowerCase().replace(/\s+/g, '-')]}`}
                            title={`Vehicle is currently ${vehicle.status}`}
                          >
                            {vehicle.status}
                          </span>
                        </div>
                        <div className={styles['vehicle-card-actions']}>
                          <button 
                            className={styles['edit-status-btn']}
                            onClick={() => handleEditStatusClick(vehicle)}
                          >
                            <Edit size={16} />
                            <span>Edit Status</span>
                          </button>
                          <button 
                            className={styles['delete-vehicle-btn']}
                            onClick={() => deleteVehicle(vehicle.id)}
                          >
                            <Trash2 size={16} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles['no-vehicles-container']}>
                  <div className={styles['no-data']}>
                    <Car size={64} />
                    <h3>No Vehicles Found</h3>
                    <p>
                      {searchQuery
                        ? "No vehicles matching your search criteria"
                        : "No vehicles in the database yet"}
                    </p>
                    {searchQuery && (
                      <button className={styles['clear-search']} onClick={() => setSearchQuery("")}>
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

      {/* Add Vehicle Modal */}
      {showModal && (
        <div className={styles['modal-overlay']}>
          <div className={styles['modal-content']}>
            <h2>Add New Vehicle</h2>
            
            <div className={styles['form-group']}>
              <label>Vehicle Name*</label>
              <input 
                type="text" 
                name="name" 
                value={newVehicle.name} 
                onChange={handleInputChange} 
                placeholder="e.g., Vanette, TownAce" 
                required 
              />
            </div>

            <div className={styles['form-group']}>
              <label>Vehicle Brand/Model</label>
              <input 
                type="text" 
                name="model" 
                value={newVehicle.model} 
                onChange={handleInputChange} 
                placeholder="e.g., Nissan, Toyota" 
              />
            </div>

            <div className={styles['form-group']}>
              <label>Plate Number*</label>
              <input 
                type="text" 
                name="plate_number" 
                value={newVehicle.plate_number} 
                onChange={handleInputChange} 
                placeholder="e.g., ABC-1234" 
                required 
              />
            </div>

            <div className={styles['form-group']}>
              <label>Vehicle Type*</label>
              <select 
                name="type" 
                value={newVehicle.type} 
                onChange={handleInputChange}
                required
              >
                <option value="">Select Type</option>
                {vehicleTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className={styles['form-group']}>
              <label>Status</label>
              <select 
                name="status" 
                value={newVehicle.status} 
                onChange={handleInputChange}
              >
                {vehicleStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className={styles['modal-actions']}>
              <button 
                className={styles['cancel-btn']} 
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button 
                className={styles['add-btn']} 
                onClick={handleAddVehicle}
              >
                Add Vehicle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {showStatusModal && currentVehicle && (
        <div className={styles['modal-overlay']} onClick={() => setShowStatusModal(false)}>
          <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
            <h2>Edit Vehicle Status</h2>
            
            <div className={styles['form-group']}>
              <label>Vehicle</label>
              <input 
                type="text" 
                value={`${currentVehicle.name} (${currentVehicle.plate_number})`}
                readOnly
              />
            </div>

            <div className={styles['form-group']}>
              <label>Current Status</label>
              <input 
                type="text" 
                value={currentVehicle.status}
                readOnly
              />
            </div>

            <div className={styles['form-group']}>
              <label>New Status</label>
              <select 
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                {vehicleStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className={styles['modal-actions']}>
              <button 
                className={styles['cancel-btn']} 
                onClick={() => setShowStatusModal(false)}
              >
                Cancel
              </button>
              <button 
                className={styles['save-btn']} 
                onClick={handleStatusChange}
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicles;