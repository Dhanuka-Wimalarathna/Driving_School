import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Search, 
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  Package,
  Bike,
  Car,
  Truck
} from "lucide-react";
import Sidebar from "../components/Sidebar/Sidebar";
import "./Packages.css";

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
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

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPackages(packages);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = packages.filter(
        (pkg) =>
          pkg.title.toLowerCase().includes(query) ||
          pkg.description.toLowerCase().includes(query) ||
          pkg.price.toString().includes(query)
      );
      setFilteredPackages(filtered);
    }
  }, [searchQuery, packages]);

  const fetchPackages = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await axios.get("http://localhost:8081/api/packages");
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
      setFilteredPackages(packagesWithSessions);
    } catch (error) {
      console.error("Error fetching packages:", error);
      setErrorMessage("Failed to load packages. Please try again later.");
      setPackages([]);
      setFilteredPackages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const validateNumberInput = (name, value) => {
    if (value === "") return true;
    const numberRegex = /^[0-9]+(\.[0-9]{1,2})?$/;
    return numberRegex.test(value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (["price", "bikeSessionAmount", "tricycleSessionAmount", "vanSessionAmount"].includes(name)) {
      const isValid = validateNumberInput(name, value);
      
      setInputErrors({
        ...inputErrors,
        [name]: !isValid
      });
      
      if (isValid) {
        if (editingPackage) {
          setEditingPackage({ ...editingPackage, [name]: value });
        } else {
          setNewPackage({ ...newPackage, [name]: value });
        }
      }
    } else {
      if (editingPackage) {
        setEditingPackage({ ...editingPackage, [name]: value });
      } else {
        setNewPackage({ ...newPackage, [name]: value });
      }
    }
  };

  const validateForm = () => {
    return !Object.values(inputErrors).some(error => error);
  };

  const handleSavePackage = async () => {
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

  const deletePackage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this package?")) return;
    
    try {
      await axios.delete(`http://localhost:8081/api/packages/${id}`);
      fetchPackages();
    } catch (error) {
      console.error("Error deleting package:", error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="packages-main-content">
        <div className="packages-container">
          <header className="packages-header">
            <div className="header-title">
              <h1>
                <span className="title-icon">
                  <Package size={24} />
                </span>
                Packages
              </h1>
              <p className="subtitle">
                {filteredPackages.length} {filteredPackages.length === 1 ? "package" : "packages"} available
              </p>
            </div>
            
            <div className="header-actions">
              <div className="search-wrapper">
                <div className="search-container">
                  <Search className="search-icon" size={18} />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search by title, description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <button
                className="add-package-btn"
                onClick={() => {
                  setEditingPackage(null);
                  setShowModal(true);
                }}
              >
                <Plus size={18} />
                <span>Add Package</span>
              </button>
            </div>
          </header>

          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading packages data...</p>
            </div>
          ) : errorMessage ? (
            <div className="error-container">
              <AlertCircle size={24} />
              <p>{errorMessage}</p>
              <button className="retry-btn" onClick={fetchPackages}>Retry</button>
            </div>
          ) : (
            <>
              {filteredPackages.length > 0 ? (
                <div className="package-cards-container">
                  {filteredPackages.map((pkg) => (
                    <div key={pkg.id} className="package-card">
                      <div className="package-header">
                        <h3 className="package-title">{pkg.title}</h3>
                        <div className="package-price">
                          {formatCurrency(pkg.price)}
                        </div>
                      </div>
                      
                      <p className="package-description">{pkg.description}</p>
                      
                      <div className="package-sessions">
                        <div className="session-item">
                          <Bike size={18} className="session-icon" />
                          <span className="session-label">Bike:</span>
                          <span className="session-value">{pkg.bikeSessionAmount || "0"}</span>
                        </div>
                        <div className="session-item">
                          <Car size={18} className="session-icon" />
                          <span className="session-label">Tricycle:</span>
                          <span className="session-value">{pkg.tricycleSessionAmount || "0"}</span>
                        </div>
                        <div className="session-item">
                          <Truck size={18} className="session-icon" />
                          <span className="session-label">Van:</span>
                          <span className="session-value">{pkg.vanSessionAmount || "0"}</span>
                        </div>
                      </div>
                      
                      <div className="package-actions">
                        <button 
                          className="edit-btn"
                          onClick={() => {
                            setEditingPackage(pkg);
                            setShowModal(true);
                          }}
                        >
                          <Edit size={16} />
                          <span>Edit</span>
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => deletePackage(pkg.id)}
                        >
                          <Trash2 size={16} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-packages-container">
                  <div className="no-data">
                    <Package size={64} />
                    <h3>No Packages Found</h3>
                    <p>
                      {searchQuery
                        ? "No packages matching your search criteria"
                        : "You don't have any packages created yet"}
                    </p>
                    {searchQuery ? (
                      <button className="clear-search" onClick={() => setSearchQuery("")}>
                        Clear search
                      </button>
                    ) : (
                      <button 
                        className="add-package-btn"
                        onClick={() => setShowModal(true)}
                      >
                        <Plus size={18} />
                        <span>Create Package</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Package Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingPackage ? "Edit Package" : "Create New Package"}</h2>
              <button 
                className="close-modal-btn" 
                onClick={() => {
                  setShowModal(false);
                  setEditingPackage(null);
                }}
              >
                &times;
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
                <label htmlFor="price">Price</label>
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
                  rows="4"
                  required
                ></textarea>
              </div>
              
              <div className="form-section">
                <h3>Session Information</h3>
                <div className="session-fields">
                  <div className="form-group">
                    <label htmlFor="bikeSessionAmount">
                      <Bike size={18} className="field-icon" />
                      Bike Sessions
                    </label>
                    <input
                      id="bikeSessionAmount"
                      type="text"
                      name="bikeSessionAmount"
                      value={editingPackage ? editingPackage.bikeSessionAmount : newPackage.bikeSessionAmount}
                      onChange={handleInputChange}
                      placeholder="Number of sessions"
                      className={inputErrors.bikeSessionAmount ? "input-error" : ""}
                    />
                    {inputErrors.bikeSessionAmount && <div className="error-message">Please enter a valid number</div>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="tricycleSessionAmount">
                      <Car size={18} className="field-icon" />
                      Tricycle Sessions
                    </label>
                    <input
                      id="tricycleSessionAmount"
                      type="text"
                      name="tricycleSessionAmount"
                      value={editingPackage ? editingPackage.tricycleSessionAmount : newPackage.tricycleSessionAmount}
                      onChange={handleInputChange}
                      placeholder="Number of sessions"
                      className={inputErrors.tricycleSessionAmount ? "input-error" : ""}
                    />
                    {inputErrors.tricycleSessionAmount && <div className="error-message">Please enter a valid number</div>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="vanSessionAmount">
                      <Truck size={18} className="field-icon" />
                      Van Sessions
                    </label>
                    <input
                      id="vanSessionAmount"
                      type="text"
                      name="vanSessionAmount"
                      value={editingPackage ? editingPackage.vanSessionAmount : newPackage.vanSessionAmount}
                      onChange={handleInputChange}
                      placeholder="Number of sessions"
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
                }}
              >
                Cancel
              </button>
              <button 
                className="save-btn"
                onClick={handleSavePackage}
              >
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