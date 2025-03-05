import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Package.css';

const Package = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('/api/packages')
      .then(response => {
        setPackages(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching packages:', error);
        setError('Failed to load packages. Please try again later.');
        setLoading(false);
      });
  }, []);

  return (
    <div className="package-container">
      <h2 className="page-title">Available Packages</h2>
      {loading && <p>Loading packages...</p>}
      {error && <p className="error-message">{error}</p>}
      <div className="package-list">
        {packages.map((pkg) => (
          <div key={pkg.id} className="package-card">
            <h3>{pkg.name}</h3>
            <p><strong>Duration:</strong> {pkg.duration} hours</p>
            <p><strong>Price:</strong> ${pkg.price}</p>
            <p><strong>Features:</strong> {pkg.features}</p>
            <button className="select-button">Select Package</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Package;
