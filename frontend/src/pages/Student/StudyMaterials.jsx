import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/Sidebar";
import './StudyMaterials.css';

const StudyMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  useEffect(() => {
    // Fetch study materials from backend
    const fetchMaterials = async () => {
      try {
        const res = await axios.get("http://localhost:8081/api/study-materials");
        setMaterials(res.data);
      } catch (err) {
        console.error("Error fetching study materials:", err);
        setMaterials([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMaterials();
  }, []);

  // Add event listener for escape key to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && previewImage) {
        closePreview();
      }
    };

    if (previewImage) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent scrolling of body when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto';
    };
  }, [previewImage]);

  // Handler for image click to open preview
  const handleImageClick = (material) => {
    setPreviewImage(material);
  };

  // Handler to close preview
  const closePreview = () => {
    setPreviewImage(null);
  };

  // Function to download the image
  const handleDownload = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || 'study-material');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to open PDF in new tab
  const handleViewPdf = (url) => {
    window.open(url, '_blank');
  };

  // Filter for supported file types (images and PDFs)
  const filteredMaterials = materials.filter(
    (mat) =>
      mat.file_type &&
      (mat.file_type.toLowerCase().includes("image") ||
       mat.file_type.toLowerCase().includes("pdf") ||
        ["jpg", "jpeg", "png", "gif", "svg", "pdf"].some((ext) =>
          mat.file_type.toLowerCase().includes(ext)
        ))
  );
  
  // Helper function to determine file type
  const getFileType = (material) => {
    if (!material.file_type) return 'unknown';
    
    if (material.file_type.toLowerCase().includes("pdf")) {
      return 'pdf';
    } else {
      return 'image';
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-layout">
        <div className="sidebar-wrapper">
          <Sidebar />
        </div>

        <div className="dashboard-content">
          <div className="dashboard-wrapper">
            {/* Header */}
            <div className="dashboard-header">
              <div className="header-content">
                <div className="header-icon">
                  <i className="bi bi-file-earmark-image"></i>
                </div>
                <div className="header-text">
                  <h1 className="page-title">Study Materials</h1>
                  <p className="page-subtitle">Browse all available study material images</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="materials-container">
              {isLoading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading study materials...</p>
                </div>
              ) : (                <div className="materials-grid">
                  {filteredMaterials.length === 0 ? (                    <div className="empty-state">
                      <div className="empty-icons">
                        <i className="bi bi-file-earmark-image"></i>
                        <i className="bi bi-file-earmark-pdf"></i>
                      </div>
                      <p>No study materials found</p>
                      <span>Check back later for new images and PDFs</span>
                    </div>
                  ) : (
                    filteredMaterials.map((mat) => (
                      <div key={mat.id} className="material-card">                        
                      {getFileType(mat) === 'image' ? (
                        <div className="material-image-container" onClick={() => handleImageClick(mat)} title="Click to preview image">
                          <img
                            src={mat.file_url}
                            alt={mat.title}
                            className="material-image"
                          />
                        </div>                      ) : (                        
                        <div className="material-pdf-container" 
                             onClick={() => handleViewPdf(mat.file_url)} 
                             title="Click to view PDF">
                          <div className="pdf-preview">
                            <i className="bi bi-file-earmark-pdf"></i>
                            <span>PDF Document</span>
                          </div>
                        </div>
                      )}                        
                      <div className="material-content">
                          <h3 className="material-title">{mat.title}</h3>
                          <p className="material-desc">{mat.description}</p>                            <button 
                            className={`material-download ${getFileType(mat) === 'pdf' ? 'pdf-download' : ''}`} 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              handleDownload(mat.file_url, mat.title); 
                            }}
                          >
                            <i className="bi bi-download"></i> 
                            {getFileType(mat) === 'pdf' ? 'Download PDF' : 'Download'}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            {/* Image Preview Modal */}
            {previewImage && (
              <div className="image-preview-modal" onClick={closePreview}>
                <div className="image-preview-content" onClick={(e) => e.stopPropagation()}>
                  <span className="close-preview" onClick={closePreview} title="Close preview">
                    &times;
                  </span>
                  <img 
                    src={previewImage.file_url} 
                    alt={previewImage.title} 
                    className="image-preview" 
                  />
                  <div className="preview-actions">
                    <button 
                      className="download-btn" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(previewImage.file_url, previewImage.title);
                      }}
                    >
                      <i className="bi bi-download"></i> Download Image
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyMaterials;