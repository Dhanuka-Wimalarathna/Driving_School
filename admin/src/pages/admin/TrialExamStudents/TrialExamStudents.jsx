import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, AlertCircle, Search } from 'lucide-react';
import './TrialExamStudents.module.css'; 
import Sidebar from '../../../components/Sidebar/Sidebar';

const TrialExamStudents = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTrial, setNewTrial] = useState({
    studentId: '',
    vehicleTypes: [],
    examDate: '',
    examTime: ''
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [updateData, setUpdateData] = useState({
    examDate: '',
    examTime: '',
    status: '',
    result: 'Not Taken' // Add this line
  });
  const [searchFilters, setSearchFilters] = useState({
    date: '',
    time: '',
    status: ''
  });

  useEffect(() => {
    fetchTrialStudents();
  }, []);

  const fetchTrialStudents = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await axios.get("http://localhost:8081/api/trial-exams/students-details");
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        const studentMap = response.data.data.reduce((acc, curr) => {
          const key = `${curr.stu_id}-${curr.exam_date}-${curr.exam_time}`;
          if (!acc[key]) {
            acc[key] = {
              id: curr.stu_id,
              name: `${curr.student_first_name} ${curr.student_last_name}`,
              vehicles: [],
              examDate: curr.exam_date,
              examTime: curr.exam_time,
              status: curr.status,
              result: curr.result || 'Not Taken'  // Add this line
            };
          }
          acc[key].vehicles.push(curr.vehicle_type);
          return acc;
        }, {});
        
        setStudents(Object.values(studentMap));
      } else {
        console.error("Unexpected API response format:", response.data);
        setStudents([]);
      }
    } catch (error) {
      console.error("Error fetching trial exam students:", error);
      setErrorMessage('Failed to load trial exam students. Please try again.');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTrial = async (e) => {
    e.preventDefault();
    try {
      await Promise.all(newTrial.vehicleTypes.map(vehicleType => 
        axios.post("http://localhost:8081/api/trial-exams", {
          studentId: newTrial.studentId,
          vehicleType,
          examDate: newTrial.examDate,
          examTime: newTrial.examTime
        })
      ));
      
      setShowAddModal(false);
      setNewTrial({
        studentId: '',
        vehicleTypes: [],
        examDate: '',
        examTime: ''
      });
      fetchTrialStudents();
      
      // Show success toast
      const toast = document.createElement("div");
      toast.className = "toast-notification success";
      toast.innerHTML = `<div>Trial exam added successfully!</div>`;
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
    } catch (error) {
      console.error("Error adding trial exam:", error);
      
      // Show error toast
      const toast = document.createElement("div");
      toast.className = "toast-notification error";
      toast.innerHTML = `<div>Failed to add trial exam.</div>`;
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
    }
  };

  // Add this function to handle opening the update modal
  const handleUpdateClick = (student) => {
    setSelectedStudent(student);
    setUpdateData({
      examDate: student.examDate || '',
      examTime: student.examTime || '',
      status: student.status || 'Pending',
      result: student.result || 'Not Taken' // Add this line
    });
    setShowUpdateModal(true);
  };

  // Add function to handle the update submission
  const handleUpdateTrial = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Include result in the update request
      await Promise.all(selectedStudent.vehicles.map(vehicleType => 
        axios.put(`http://localhost:8081/api/trial-exams/update`, {
          studentId: selectedStudent.id,
          vehicleType: vehicleType,
          examDate: updateData.examDate,
          examTime: updateData.examTime,
          status: updateData.status,
          result: updateData.result  // Add this line
        })
      ));
      
      setShowUpdateModal(false);
      fetchTrialStudents(); // Refresh data
      
      // Show success toast
      const toast = document.createElement("div");
      toast.className = "toast-notification success";
      toast.innerHTML = `<div>Trial exam updated successfully!</div>`;
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
    } catch (error) {
      console.error("Error updating trial exam:", error);
      
      // Show error toast
      const toast = document.createElement("div");
      toast.className = "toast-notification error";
      toast.innerHTML = `<div>Failed to update trial exam.</div>`;
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const filteredStudents = students.filter(student => {
    const dateMatch = !searchFilters.date || student.examDate === searchFilters.date;
    const timeMatch = !searchFilters.time || student.examTime === searchFilters.time;
    const statusMatch = !searchFilters.status || student.status === searchFilters.status;
    return dateMatch && timeMatch && statusMatch;
  });

  return (
    <div className="dashboard-layout">
      <Sidebar sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      
      <main className="trial-exam-main-content">
        <div className="trial-exam-container">
          <header className="header-section">
            <div className="header-title">
              <h1>
                <span className="title-icon">
                  <Calendar size={24} />
                </span>
                Trial Exam Students
              </h1>
              <p className="subtitle">
                Manage students approved for trial examinations
              </p>
            </div>
            <div className="search-container">
              <input
                type="date"
                value={searchFilters.date}
                onChange={(e) => setSearchFilters({...searchFilters, date: e.target.value})}
                placeholder="Filter by date"
                className="search-input"
              />
              <input
                type="time"
                value={searchFilters.time}
                onChange={(e) => setSearchFilters({...searchFilters, time: e.target.value})}
                placeholder="Filter by time"
                className="search-input"
              />
              <select
                value={searchFilters.status}
                onChange={(e) => setSearchFilters({...searchFilters, status: e.target.value})}
                className="search-input"
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </header>

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading trial exam students...</p>
            </div>
          ) : errorMessage ? (
            <div className="no-data">
              <AlertCircle size={32} />
              <p>{errorMessage}</p>
              <button className="retry-btn" onClick={fetchTrialStudents}>Retry</button>
            </div>
          ) : students.length > 0 ? (
            <div className="students-table-container">
              <table className="students-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Vehicle Categories</th>
                    <th>Exam Date</th>
                    <th>Exam Time</th>
                    <th>Status</th>
                    <th>Result</th> {/* Add this line */}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={`${student.id}-${student.examDate}`}>
                      <td>{student.name}</td>
                      <td>
                        <div className="badges-container">
                          {student.vehicles.map((vehicle, index) => (
                            <span key={index} className="vehicle-badge">
                              {vehicle}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>{student.examDate ? new Date(student.examDate).toLocaleDateString() : "Not scheduled"}</td>
                      <td>{student.examTime || "Not scheduled"}</td>
                      <td>
                        <span className={`status-badge status-${student.status?.toLowerCase() || 'pending'}`}>
                          {student.status || "Pending"}
                        </span>
                      </td>
                      <td>
                        <span className={`result-badge result-${student.result?.toLowerCase() || 'not-taken'}`}>
                          {student.result || "Not Taken"}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button 
                            className="update-button"
                            onClick={() => handleUpdateClick(student)}
                          >
                            Update
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-data">
              <Calendar size={32} />
              <p>No approved trial students found</p>
            </div>
          )}
        </div>
      </main>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="add-modal">
            <h3>Add New Trial Exam</h3>
            <form onSubmit={handleAddTrial}>
              <div className="form-group">
                <label>Student ID:</label>
                <input
                  type="number"
                  value={newTrial.studentId}
                  onChange={(e) => setNewTrial({...newTrial, studentId: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Vehicle Types:</label>
                <select
                  multiple
                  value={newTrial.vehicleTypes}
                  onChange={(e) => setNewTrial({
                    ...newTrial,
                    vehicleTypes: Array.from(e.target.selectedOptions, option => option.value)
                  })}
                  required
                  size="3"
                >
                  <option value="Bike">Bike</option>
                  <option value="Three-Wheeler">Three-Wheeler</option>
                  <option value="Van">Van</option>
                </select>
              </div>
              <div className="form-group">
                <label>Exam Date:</label>
                <input
                  type="date"
                  value={newTrial.examDate}
                  onChange={(e) => setNewTrial({...newTrial, examDate: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Exam Time:</label>
                <input
                  type="time"
                  value={newTrial.examTime}
                  onChange={(e) => setNewTrial({...newTrial, examTime: e.target.value})}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit">Add Trial</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && selectedStudent && (
        <div className="modal-overlay">
          <div className="update-modal">
            <h3>Update Trial Exam</h3>
            <p className="update-student-info">Student: {selectedStudent.name}</p>
            <div className="vehicle-list">
              <span>Vehicles:</span>
              <div className="badges-container">
                {selectedStudent.vehicles.map((vehicle, index) => (
                  <span key={index} className="vehicle-badge">
                    {vehicle}
                  </span>
                ))}
              </div>
            </div>
            <form onSubmit={handleUpdateTrial}>
              <div className="form-group">
                <label>Exam Date:</label>
                <input
                  type="date"
                  value={updateData.examDate}
                  onChange={(e) => setUpdateData({...updateData, examDate: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Exam Time:</label>
                <input
                  type="time"
                  value={updateData.examTime}
                  onChange={(e) => setUpdateData({...updateData, examTime: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Status:</label>
                <select
                  value={updateData.status}
                  onChange={(e) => setUpdateData({...updateData, status: e.target.value})}
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Completed">Completed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div className="form-group">
                <label>Result:</label>
                <select
                  value={updateData.result}
                  onChange={(e) => setUpdateData({...updateData, result: e.target.value})}
                  required
                >
                  <option value="Not Taken">Not Taken</option>
                  <option value="Pass">Pass</option>
                  <option value="Fail">Fail</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => setShowUpdateModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="button-spinner"></div>
                      <span>Updating...</span>
                    </>
                  ) : "Update Trial"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrialExamStudents;