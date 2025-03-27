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
    image: ""
  });
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

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

  // Handle image upload to Cloudinary
  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'vehicle_images'); // Replace with your upload preset
    
    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload`, // Replace YOUR_CLOUD_NAME
        formData
      );
      return response.data.secure_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  // Function to add a vehicle
  const handleAddVehicle = async () => {
    if (!newVehicle.name || !newVehicle.plate_number || !newVehicle.type) {
      alert("Please fill in all required fields");
      return;
    }

    setIsUploading(true);
    
    try {
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile);
      }

      const vehicleWithImage = {
        ...newVehicle,
        image: imageUrl
      };

      await axios.post("http://localhost:8081/api/vehicles/addVehicle", vehicleWithImage);
      
      setShowModal(false);
      setNewVehicle({ 
        name: "", 
        model: "", 
        plate_number: "", 
        type: "", 
        status: "Available",
        image: ""
      });
      setImageFile(null);
      fetchVehicles();
    } catch (error) {
      console.error("Error adding vehicle:", error);
      alert("Failed to add vehicle. Please try again.");
    } finally {
      setIsUploading(false);
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
                {vehicle.image && (
                  <div className="vehicle-image">
                    <img src={vehicle.image} alt={`${vehicle.name} ${vehicle.model}`} />
                  </div>
                )}
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

            <div className="form-group">
              <label>Vehicle Image</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
              />
              {imageFile && (
                <div className="image-preview">
                  <img 
                    src={URL.createObjectURL(imageFile)} 
                    alt="Preview" 
                  />
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button 
                className="cancel-btn" 
                onClick={() => setShowModal(false)}
                disabled={isUploading}
              >
                Cancel
              </button>
              <button 
                className="add-btn" 
                onClick={handleAddVehicle}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Add Vehicle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicles;