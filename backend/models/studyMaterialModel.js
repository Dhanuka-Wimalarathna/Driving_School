import mysql from 'mysql2';
import sqldb from '../config/sqldb.js';

// Get all study materials - MODIFIED TO REMOVE USER JOIN
export const getAllStudyMaterials = (callback) => {
  const query = `
    SELECT * FROM study_materials
    ORDER BY created_at DESC
  `;
  
  sqldb.query(query, callback);
};

// Create a new study material
export const createStudyMaterial = (materialData, callback) => {
  const query = `
    INSERT INTO study_materials (
      title, 
      description, 
      file_url, 
      file_type, 
      file_size, 
      cloudinary_id, 
      created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  const values = [
    materialData.title,
    materialData.description,
    materialData.file_url,
    materialData.file_type,
    materialData.file_size,
    materialData.cloudinary_id,
    materialData.created_by || null
  ];
  
  sqldb.query(query, values, callback);
};

// Get a study material by ID - MODIFIED
export const getStudyMaterialById = (id, callback) => {
  const query = `
    SELECT * FROM study_materials 
    WHERE id = ?
  `;
  
  sqldb.query(query, [id], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results[0]);
  });
};

// Delete a study material
export const deleteStudyMaterial = (id, callback) => {
  const query = 'DELETE FROM study_materials WHERE id = ?';
  sqldb.query(query, [id], callback);
};

// Get study materials by category - MODIFIED
export const getStudyMaterialsByCategory = (category, callback) => {
  const query = `
    SELECT * FROM study_materials
    WHERE category = ?
    ORDER BY created_at DESC
  `;
  
  sqldb.query(query, [category], callback);
};

// Search study materials - MODIFIED
export const searchStudyMaterials = (searchTerm, callback) => {
  const query = `
    SELECT * FROM study_materials
    WHERE 
      title LIKE ? OR
      description LIKE ?
    ORDER BY created_at DESC
  `;
  
  const searchPattern = `%${searchTerm}%`;
  sqldb.query(query, [searchPattern, searchPattern], callback);
};