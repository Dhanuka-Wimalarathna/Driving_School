import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
import Sidebar from "../../../components/Sidebar/Sidebar";
import styles from "./Packages.module.css";

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
    bike_sessions: "",
    tricycle_sessions: "",
    van_sessions: "",
  });
  const [inputErrors, setInputErrors] = useState({
    price: false,
    bike_sessions: false,
    tricycle_sessions: false,
    van_sessions: false,
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/admin/sign-in');
      return;
    }
    
    // Fetch packages data
    fetchPackages();
  }, [navigate]);

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

  // Toast notification function
  const showToast = (message, type) => {
    const toast = document.createElement("div");
    toast.className = `${styles["toast-notification"]} ${styles[type]}`;
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  };

  const fetchPackages = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await axios.get("http://localhost:8081/api/packages");
      setPackages(response.data);
      setFilteredPackages(response.data);
    } catch (error) {
      console.error("Error fetching packages:", error);
      setErrorMessage("Failed to load packages. Please try again later.");
      showToast("Failed to load packages. Please try again later.", "error");
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
    
    if (["price", "bike_sessions", "tricycle_sessions", "van_sessions"].includes(name)) {
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
      showToast("Please correct the errors in the form before submitting.", "error");
      return;
    }

    try {
      const packageData = editingPackage || newPackage;
      const formattedData = {
        ...packageData,
        price: parseFloat(packageData.price),
        bike_sessions: parseInt(packageData.bike_sessions),
        tricycle_sessions: parseInt(packageData.tricycle_sessions),
        van_sessions: parseInt(packageData.van_sessions)
      };

      if (editingPackage) {
        await axios.put(`http://localhost:8081/api/packages/${editingPackage.id}`, formattedData);
        showToast(`Package "${formattedData.title}" was updated successfully!`, "success");
      } else {
        await axios.post("http://localhost:8081/api/packages/addPackage", formattedData);
        showToast(`Package "${formattedData.title}" was created successfully!`, "success");
      }

      setShowModal(false);
      setEditingPackage(null);
      setNewPackage({
        title: "",
        description: "",
        price: "",
        details: "",
        bike_sessions: "",
        tricycle_sessions: "",
        van_sessions: "",
      });
      setInputErrors({
        price: false,
        bike_sessions: false,
        tricycle_sessions: false,
        van_sessions: false,
      });
      fetchPackages();
    } catch (error) {
      console.error("Error saving package:", error);
      showToast(`Failed to ${editingPackage ? 'update' : 'create'} package. Please try again.`, "error");
    }
  };

  const deletePackage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this package?")) return;
    
    try {
      await axios.delete(`http://localhost:8081/api/packages/${id}`);
      showToast("Package was deleted successfully!", "success");
      fetchPackages();
    } catch (error) {
      console.error("Error deleting package:", error);
      showToast("Failed to delete package. Please try again.", "error");
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

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="app-layout">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <main className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="page-container">
          <div className={styles['packages-content']}>
            <header className={styles['page-header']}>
              <div className={styles['header-title']}>
                <h1>
                  <span className={styles['title-icon']}>
                    <Package size={24} />
                  </span>
                  Packages
                </h1>
                <p className={styles.subtitle}>
                  {filteredPackages.length} {filteredPackages.length === 1 ? "package" : "packages"} available
                </p>
              </div>
              
              <div className={styles['header-actions']}>
                <div className={styles['search-wrapper']}>
                  <div className={styles['search-container']}>
                    <Search className={styles['search-icon']} size={18} />
                    <input
                      type="text"
                      className={styles['search-input']}
                      placeholder="Search by title, description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  className={styles['add-package-btn']}
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
              <div className={styles['loading-container']}>
                <div className={styles['loading-spinner']}></div>
                <p>Loading packages data...</p>
              </div>
            ) : errorMessage ? (
              <div className={styles['error-container']}>
                <AlertCircle size={24} />
                <p>{errorMessage}</p>
                <button className={styles['retry-btn']} onClick={fetchPackages}>
                  Retry
                </button>
              </div>
            ) : (
              <>
                {filteredPackages.length > 0 ? (
                  <div className={styles['package-cards-container']}>
                    {filteredPackages.map((pkg) => (
                      <div key={pkg.id} className={styles['package-card']}>
                        <div className={styles['package-header']}>
                          <h3 className={styles['package-title']}>{pkg.title}</h3>
                          <div className={styles['package-price']}>
                            {formatCurrency(pkg.price)}
                          </div>
                        </div>
                        
                        <p className={styles['package-description']}>{pkg.description}</p>
                        <div className={styles['package-sessions']}>
                          <div className={styles['session-item']}>
                            <Bike size={18} className={styles['session-icon']} />
                            <span className={styles['session-label']}>Bike:</span>
                            <span className={styles['session-value']}>{pkg.bike_sessions}</span>
                          </div>
                          <div className={styles['session-item']}>
                            <Car size={18} className={styles['session-icon']} />
                            <span className={styles['session-label']}>Tricycle:</span>
                            <span className={styles['session-value']}>{pkg.tricycle_sessions}</span>
                          </div>
                          <div className={styles['session-item']}>
                            <Truck size={18} className={styles['session-icon']} />
                            <span className={styles['session-label']}>Van:</span>
                            <span className={styles['session-value']}>{pkg.van_sessions}</span>
                          </div>
                        </div>
                        <div className={styles['package-actions']}>
                          <button 
                            className={styles['edit-btn']}
                            onClick={() => {
                              setEditingPackage(pkg);
                              setShowModal(true);
                            }}
                          >
                            <Edit size={16} />
                            <span>Edit</span>
                          </button>
                          <button 
                            className={styles['delete-btn']}
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
                  <div className={styles['no-packages-container']}>
                    <div className={styles['no-data']}>
                      <Package size={64} />
                      <h3>No Packages Found</h3>
                      <p>
                        {searchQuery
                          ? "No packages matching your search criteria"
                          : "You don't have any packages created yet"}
                      </p>
                      {searchQuery ? (
                        <button className={styles['clear-search']} onClick={() => setSearchQuery("")}>
                          Clear search
                        </button>
                      ) : (
                        <button 
                          className={styles['add-package-btn']}
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
        </div>

        {/* Package Modal */}
        {showModal && (
          <div className={styles['modal-overlay']} onClick={() => setShowModal(false)}>
            <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
              <div className={styles['modal-header']}>
                <h2>{editingPackage ? "Edit Package" : "Create New Package"}</h2>
                <button 
                  className={styles['close-modal-btn']} 
                  onClick={() => {
                    setShowModal(false);
                    setEditingPackage(null);
                  }}
                >
                  &times;
                </button>
              </div>
              
              <div className={styles['form-container']}>
                <div className={styles['form-group']}>
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
                
                <div className={styles['form-group']}>
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
                
                <div className={styles['form-group']}>
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
                
                <div className={styles['form-group']}>
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
                
                <div className={styles['form-section']}>
                  <h3>Session Information</h3>
                  <div className={styles['session-fields']}>
                    <div className={styles['form-group']}>
                      <label htmlFor="bike_sessions">
                        <Bike size={18} className="field-icon" />
                        Bike Sessions
                      </label>
                      <input
                        id="bike_sessions"
                        type="text"
                        name="bike_sessions"
                        value={editingPackage ? editingPackage.bike_sessions : newPackage.bike_sessions}
                        onChange={handleInputChange}
                        placeholder="Number of sessions"
                        className={inputErrors.bike_sessions ? "input-error" : ""}
                      />
                      {inputErrors.bike_sessions && <div className="error-message">Please enter a valid number</div>}
                    </div>
                    
                    <div className={styles['form-group']}>
                      <label htmlFor="tricycle_sessions">
                        <Car size={18} className="field-icon" />
                        Tricycle Sessions
                      </label>
                      <input
                        id="tricycle_sessions"
                        type="text"
                        name="tricycle_sessions"
                        value={editingPackage ? editingPackage.tricycle_sessions : newPackage.tricycle_sessions}
                        onChange={handleInputChange}
                        placeholder="Number of sessions"
                        className={inputErrors.tricycle_sessions ? "input-error" : ""}
                      />
                      {inputErrors.tricycle_sessions && <div className="error-message">Please enter a valid number</div>}
                    </div>
                    
                    <div className={styles['form-group']}>
                      <label htmlFor="van_sessions">
                        <Truck size={18} className="field-icon" />
                        Van Sessions
                      </label>
                      <input
                        id="van_sessions"
                        type="text"
                        name="van_sessions"
                        value={editingPackage ? editingPackage.van_sessions : newPackage.van_sessions}
                        onChange={handleInputChange}
                        placeholder="Number of sessions"
                        className={inputErrors.van_sessions ? "input-error" : ""}
                      />
                      {inputErrors.van_sessions && <div className="error-message">Please enter a valid number</div>}
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles['modal-actions']}>
                <button
                  className={styles['cancel-btn']}
                  onClick={() => {
                    setShowModal(false);
                    setEditingPackage(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  className={styles['save-btn']}
                  onClick={handleSavePackage}
                >
                  {editingPackage ? "Update Package" : "Create Package"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Packages;