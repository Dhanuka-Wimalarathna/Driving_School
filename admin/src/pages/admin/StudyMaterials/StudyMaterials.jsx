import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { 
  FileText,
  Plus,
  Trash2,
  AlertCircle,
  Download,
  Upload,
  File,
  FileImage,
  FileArchive,
  FileCode,
  X
} from "lucide-react";
import styles from './StudyMaterials.module.css';

const StudyMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [previewMaterial, setPreviewMaterial] = useState(null);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Material upload state
  const [uploadState, setUploadState] = useState({
    file: null,
    title: "",
    description: "",
    isUploading: false
  });

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/admin/sign-in');
      return;
    }
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await axios.get("http://localhost:8081/api/study-materials");
      setMaterials(response.data);
    } catch (error) {
      console.error("Error fetching study materials:", error);
      setErrorMessage(error.response?.data?.message || "Failed to load study materials. Please try again later.");
      setMaterials([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadState({
        ...uploadState,
        file: file
      });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadState({
        ...uploadState,
        file: e.dataTransfer.files[0]
      });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setUploadState({
      file: null,
      title: "",
      description: "",
      isUploading: false
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUploadState({
      ...uploadState,
      [name]: value
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!uploadState.file || !uploadState.title) {
      alert("Please select a file and provide a title");
      return;
    }

    setUploadState({ ...uploadState, isUploading: true });

    try {
      // Create a FormData instance to send the file and metadata
      const formData = new FormData();
      formData.append('file', uploadState.file);
      formData.append('title', uploadState.title);
      formData.append('description', uploadState.description);

      // Get the token from local storage
      const token = localStorage.getItem('authToken');

      // Upload to your server with Cloudinary integration
      const response = await axios.post(
        "http://localhost:8081/api/study-materials/upload",
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Add the new material to the list
      setMaterials([...materials, response.data.material]);
      
      // Reset form and close modal
      handleCloseModal();
    } catch (error) {
      console.error("Error uploading material:", error);
      alert(error.response?.data?.message || "Failed to upload material. Please try again.");
    } finally {
      setUploadState({ ...uploadState, isUploading: false });
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm("Are you sure you want to delete this study material?")) return;
    
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`http://localhost:8081/api/study-materials/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setMaterials(materials.filter(m => m.id !== id));
    } catch (error) {
      console.error("Error deleting material:", error);
      alert(error.response?.data?.message || "Failed to delete material. Please try again.");
    }
  };

  const handleDownload = (fileUrl, fileName) => {
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = fileUrl;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return <File size={24} />;
    
    fileType = fileType.toLowerCase();
    
    if (fileType.includes('pdf')) {
      return <FileText size={24} />; // Changed from FilePdf to FileText for PDF files
    } else if (fileType.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'svg'].some(ext => fileType.includes(ext))) {
      return <FileImage size={24} />;
    } else if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z')) {
      return <FileArchive size={24} />;
    } else if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'php', 'py', 'java', 'c', 'cpp'].some(ext => fileType.includes(ext))) {
      return <FileCode size={24} />;
    } else {
      return <FileText size={24} />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const getUploader = (material) => {
    if (material.firstName && material.lastName) {
      return `${material.firstName} ${material.lastName}`;
    }
    return "Admin User";
  }

  // Preview handlers
  const handlePreviewClick = (material) => {
    // Only allow preview for images
    const fileType = material.file_type?.toLowerCase() || '';
    if (
      fileType.includes('image') ||
      ['jpg', 'jpeg', 'png', 'gif', 'svg'].some(ext => fileType.includes(ext))
    ) {
      setPreviewMaterial(material);
    }
  };
  const closePreview = () => setPreviewMaterial(null);

  return (
    <div className={styles['dashboard-layout']}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <main className={`main-content ${sidebarCollapsed ? styles['sidebar-collapsed'] : ''}`}> {/* Use main-content for consistency */}
        <div className={styles['dashboard-content']}> {/* Use dashboard-content for consistent max-width and padding */}
          <div className={styles['page-header']}>
            <h1>Study Materials</h1>
            <div className={styles['header-actions']}>
              <button 
                className={styles['add-material-btn']}
                onClick={() => setShowModal(true)}
              >
                <Plus size={16} />
                <span>Add Material</span>
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className={styles['loading-container']}>
              <div className={styles['loading-spinner']}></div>
              <p>Loading study materials...</p>
            </div>
          ) : errorMessage ? (
            <div className={styles['error-container']}>
              <AlertCircle size={24} />
              <p>{errorMessage}</p>
              <button className={styles['retry-btn']} onClick={fetchMaterials}>Retry</button>
            </div>
          ) : (
            <>
              {materials.length > 0 ? (
                <div className={styles['material-cards-container']}>
                  {materials.map((material) => {
                    const fileType = material.file_type?.toLowerCase() || '';
                    const isImage = fileType.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'svg'].some(ext => fileType.includes(ext));
                    return (
                      <div key={material.id} className={styles['material-card']}>
                        <div 
                          className={styles['material-preview']} 
                          style={isImage ? { cursor: 'pointer' } : {}}
                          onClick={isImage ? () => handlePreviewClick(material) : undefined}
                        >
                          {isImage ? (
                            <img 
                              src={material.file_url} 
                              alt={material.title}
                              className={styles['material-preview-image']} 
                            />
                          ) : (
                            <div className={styles['material-type-icon']}>
                              {getFileIcon(material.file_type)}
                            </div>
                          )}
                        </div>
                        <div className={styles['material-details']}>
                          <h3 className={styles['material-name']}>{material.title}</h3>
                          <p className={styles['material-description']}>{material.description}</p>
                          <div className={styles['material-info']}>
                            <span className={styles['info-label']}>Size:</span>
                            <span className={styles['info-value']}>{formatFileSize(material.file_size || 0)}</span>
                          </div>
                          <div className={styles['material-card-actions']}>
                            <button 
                              className={styles['delete-material-btn']}
                              onClick={() => handleDeleteMaterial(material.id)}
                            >
                              <Trash2 size={16} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className={styles['no-materials-container']}>
                  <div className={styles['no-materials']}>
                    <FileText size={64} />
                    <h3>No Study Materials Found</h3>
                    <p>No materials have been uploaded yet. Click the "Add Material" button to upload your first study material.</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Image Preview Modal */}
          {previewMaterial && (
            <div className={styles['preview-modal-overlay']} onClick={closePreview}>
              <div className={styles['preview-modal-content']} onClick={e => e.stopPropagation()}>
                <div className={styles['preview-header']}>
                  <h3>{previewMaterial.title}</h3>
                  <button className={styles['preview-close']} onClick={closePreview}>
                    <X size={24} />
                  </button>
                </div>
                <div className={styles['preview-image-container']}>
                  <img 
                    src={previewMaterial.file_url} 
                    alt={previewMaterial.title}
                    className={styles['preview-image']} 
                  />
                </div>
                <div className={styles['preview-footer']}>
                  <p>{previewMaterial.description}</p>
                  <div className={styles['preview-actions']}>
                    <button 
                      className={styles['download-btn']}
                      onClick={() => handleDownload(previewMaterial.file_url, previewMaterial.title)}
                    >
                      <Download size={16} />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upload Material Modal */}
          {showModal && (
            <div className={styles['modal-overlay']}>
              <div className={styles['modal-content']}>
                <h2>Upload Study Material</h2>
                <form onSubmit={handleUpload}>
                  {/* Title field */}
                  <div className={styles['form-group']}>
                    <label htmlFor="title">Title</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={uploadState.title}
                      onChange={handleInputChange}
                      placeholder="Enter a title for the material"
                      required
                    />
                  </div>

                  {/* Description field */}
                  <div className={styles['form-group']}>
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={uploadState.description}
                      onChange={handleInputChange}
                      placeholder="Enter a description for the material"
                    />
                  </div>

                  {/* File upload */}
                  <div className={styles['form-group']}>
                    <label htmlFor="file">File</label>
                    <div className={styles['file-upload-container']}>
                      <input 
                        type="file" 
                        id="file" 
                        ref={fileInputRef}
                        onChange={handleFileSelect} 
                        style={{ display: 'none' }} 
                      />
                      <div 
                        className={`${styles['file-upload-box']} ${uploadState.file ? styles['active'] : ''}`}
                        onClick={() => fileInputRef.current.click()}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                      >
                        <div className={styles['file-upload-icon']}>
                          <Upload size={32} />
                        </div>
                        <p className={styles['file-upload-text']}>
                          <strong>Click to upload</strong> or drag and drop
                        </p>
                        <p className={styles['file-upload-text']}>
                          PDF, DOC, PPT, XLS, TXT, PNG, JPG, etc. up to 10MB
                        </p>
                      </div>

                      {uploadState.file && (
                        <div className={styles['selected-file-info']}>
                          <div className={styles['file-info-icon']}>
                            {getFileIcon(uploadState.file.type)}
                          </div>
                          <div className={styles['file-info-details']}>
                            <p className={styles['file-info-name']}>{uploadState.file.name}</p>
                            <p className={styles['file-info-size']}>{formatFileSize(uploadState.file.size)}</p>
                          </div>
                          <button 
                            type="button" 
                            className={styles['file-info-remove']}
                            onClick={() => setUploadState({ ...uploadState, file: null })}
                          >
                            <X size={20} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles['modal-actions']}>
                    <button 
                      type="button" 
                      className={styles['cancel-btn']}
                      onClick={handleCloseModal}
                      disabled={uploadState.isUploading}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className={styles['submit-btn']}
                      disabled={!uploadState.file || !uploadState.title || uploadState.isUploading}
                    >
                      {uploadState.isUploading ? 'Uploading...' : 'Upload Material'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudyMaterials;
