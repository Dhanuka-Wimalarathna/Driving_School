import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, AlertCircle, Search } from 'lucide-react';
import styles from './TrialExamStudents.module.css';
import Sidebar from '../../../components/Sidebar/Sidebar';

const TrialExamStudents = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [groupedStudents, setGroupedStudents] = useState({});
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
    result: 'Not Taken'
  });
  const [searchFilters, setSearchFilters] = useState({
    date: '',
    time: '',
    status: ''
  });

  useEffect(() => {
    fetchTrialStudents();
  }, []);

  // Group students data by student ID
  useEffect(() => {
    const grouped = {};
    students.forEach(student => {
      if (!grouped[student.stu_id]) {
        grouped[student.stu_id] = {
          studentInfo: {
            stu_id: student.stu_id,
            first_name: student.first_name,
            last_name: student.last_name,
            email: student.email,
            phone_number: student.phone_number
          },
          trials: []
        };
      }
      
      grouped[student.stu_id].trials.push({
        exam_id: student.exam_id,
        vehicle_type: student.vehicle_type,
        exam_date: student.exam_date,
        exam_time: student.exam_time,
        status: student.status,
        result: student.result || 'Not Taken'
      });
    });
    
    setGroupedStudents(grouped);
  }, [students]);

  const fetchTrialStudents = async () => {
    setLoading(true);
    setErrorMessage('');
    
    try {
      // Use the endpoint that returns all trial students
      const response = await axios.get("http://localhost:8081/api/trial-exams/all-students");
      
      // Process the response data which already includes student information
      const trialExams = response.data?.data || [];
      
      // Map the data to the format expected by the component
      const formattedData = trialExams.map(exam => ({
        exam_id: exam.exam_id,
        stu_id: exam.stu_id,
        vehicle_type: exam.vehicle_type,
        exam_date: exam.exam_date,
        exam_time: exam.exam_time,
        status: exam.status,
        result: exam.result || 'Not Taken',
        first_name: exam.student_first_name,
        last_name: exam.student_last_name,
        // Add placeholder values for fields that might be missing
        email: '',
        phone_number: ''
      }));
      
      setStudents(formattedData);
    } catch (error) {
      console.error("Error fetching trial students:", error);
      setErrorMessage('Failed to load trial students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    // Use the original students data to re-apply filters
    if (!students.length) return;
    
    let filtered = [...students];
    
    // Apply filters
    if (searchFilters.date) {
      filtered = filtered.filter(student => 
        student.exam_date === searchFilters.date
      );
    }
    
    if (searchFilters.time) {
      filtered = filtered.filter(student => 
        student.exam_time === searchFilters.time
      );
    }
    
    if (searchFilters.status) {
      filtered = filtered.filter(student => 
        student.status === searchFilters.status
      );
    }
    
    // Re-group the filtered students
    const grouped = {};
    filtered.forEach(student => {
      if (!grouped[student.stu_id]) {
        grouped[student.stu_id] = {
          studentInfo: {
            stu_id: student.stu_id,
            first_name: student.first_name,
            last_name: student.last_name,
            email: student.email,
            phone_number: student.phone_number
          },
          trials: []
        };
      }
      
      grouped[student.stu_id].trials.push({
        exam_id: student.exam_id,
        vehicle_type: student.vehicle_type,
        exam_date: student.exam_date,
        exam_time: student.exam_time,
        status: student.status,
        result: student.result || 'Not Taken'
      });
    });
    
    setGroupedStudents(grouped);
  };

  useEffect(() => {
    applyFilters();
  }, [searchFilters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setSearchFilters({
      date: '',
      time: '',
      status: ''
    });
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
      toast.className = `${styles['toast-notification']} ${styles['success']}`;
      toast.innerHTML = `<div>Trial exam added successfully!</div>`;
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
    } catch (error) {
      console.error("Error adding trial exam:", error);
      
      // Show error toast
      const toast = document.createElement("div");
      toast.className = `${styles['toast-notification']} ${styles['error']}`;
      toast.innerHTML = `<div>Failed to add trial exam.</div>`;
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
    }
  };

  const handleUpdateClick = (student, trial) => {
    setSelectedStudent({
      ...student,
      ...trial
    });
    
    setUpdateData({
      examDate: trial.exam_date || '',
      examTime: trial.exam_time || '',
      status: trial.status || 'Pending',
      result: trial.result || 'Not Taken'
    });
    
    setShowUpdateModal(true);
  };

  const handleUpdateTrial = async (e) => {
    e.preventDefault();
    
    try {
      await axios.put(`http://localhost:8081/api/trial-exams/${selectedStudent.exam_id}`, {
        studentId: selectedStudent.stu_id,
        vehicleType: selectedStudent.vehicle_type,
        examDate: updateData.examDate,
        examTime: updateData.examTime,
        status: updateData.status,
        result: updateData.result
      });
      
      setShowUpdateModal(false);
      fetchTrialStudents();
      
      // Show success toast
      const toast = document.createElement("div");
      toast.className = `${styles['toast-notification']} ${styles['success']}`;
      toast.innerHTML = `<div>Trial exam updated successfully!</div>`;
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
    } catch (error) {
      console.error("Error updating trial exam:", error);
      
      // Show error toast
      const toast = document.createElement("div");
      toast.className = `${styles['toast-notification']} ${styles['error']}`;
      toast.innerHTML = `<div>Failed to update trial exam.</div>`;
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className={styles['trial-students-page']}>
      <Sidebar collapsed={sidebarCollapsed} />
      
      <div className={styles['trial-students-content']}>
        <div className={styles['page-header']}>
          <h2>Trial Examination Students</h2>
        </div>
        
        <div className={styles['filter-section']}>
          <div className={styles['filter-inputs']}>
            <div className={styles['filter-group']}>
              <label>Exam Date</label>
              <input 
                type="date" 
                name="date"
                value={searchFilters.date}
                onChange={handleFilterChange}
              />
            </div>
            
            <div className={styles['filter-group']}>
              <label>Exam Time</label>
              <input 
                type="time" 
                name="time"
                value={searchFilters.time}
                onChange={handleFilterChange}
              />
            </div>
            
            <div className={styles['filter-group']}>
              <label>Status</label>
              <select 
                name="status"
                value={searchFilters.status}
                onChange={handleFilterChange}
              >
                <option value="">All</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
          
          <button 
            className={styles['reset-filters-btn']}
            onClick={resetFilters}
          >
            Reset Filters
          </button>
        </div>
        
        {loading ? (
          <div className={styles['loading-spinner']}>
            <div className={styles['spinner']}></div>
            <p>Loading trial students...</p>
          </div>
        ) : errorMessage ? (
          <div className={styles['error-message']}>
            <AlertCircle size={20} />
            <p>{errorMessage}</p>
            <button onClick={fetchTrialStudents}>Try Again</button>
          </div>
        ) : Object.keys(groupedStudents).length === 0 ? (
          <div className={styles['no-data']}>
            <Calendar size={48} />
            <h3>No Trial Students</h3>
            <p>There are no students scheduled for trial examinations.</p>
            <button 
              className={styles['add-student-btn']}
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={16} />
              <span>Add New Trial</span>
            </button>
          </div>
        ) : (
          <div className={styles['students-list']}>
            {Object.values(groupedStudents).map((groupedStudent) => (
              <div 
                key={groupedStudent.studentInfo.stu_id} 
                className={styles['student-card']}
              >
                <div className={styles['student-info']}>
                  <h3>
                    {groupedStudent.studentInfo.first_name} {groupedStudent.studentInfo.last_name}
                  </h3>
                  <div className={styles['student-details']}>
                    <div className={styles['student-id']}>
                      ID: {groupedStudent.studentInfo.stu_id}
                    </div>
                    <div className={styles['student-contact']}>
                      {groupedStudent.studentInfo.email} • {groupedStudent.studentInfo.phone_number}
                    </div>
                  </div>
                </div>
                
                <div className={styles['student-trials']}>
                  <h4>Trial Examinations</h4>
                  <div className={styles['trials-table-container']}>
                    <table className={styles['trials-table']}>
                      <thead>
                        <tr>
                          <th>Vehicle Type</th>
                          <th>Exam Date</th>
                          <th>Exam Time</th>
                          <th>Status</th>
                          <th>Result</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupedStudent.trials.map(trial => (
                          <tr key={trial.exam_id}>
                            <td>
                              <div className={`${styles['vehicle-badge']}`}>
                                {trial.vehicle_type}
                              </div>
                            </td>
                            <td>{trial.exam_date ? new Date(trial.exam_date).toLocaleDateString() : 'Not Set'}</td>
                            <td>{trial.exam_time || 'Not Set'}</td>
                            <td>
                              <div className={`${styles['status-badge']} ${styles[trial.status.toLowerCase()]}`}>
                                {trial.status}
                              </div>
                            </td>
                            <td>
                              <div className={`${styles['result-badge']} ${styles[trial.result.toLowerCase().replace(' ', '-')]}`}>
                                {trial.result}
                              </div>
                            </td>
                            <td>
                              <button 
                                className={styles['edit-btn']}
                                onClick={() => handleUpdateClick(groupedStudent.studentInfo, trial)}
                              >
                                Update
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Add New Trial Modal */}
      {showAddModal && (
        <div className={styles['modal-overlay']}>
          <div className={styles['add-modal']}>
            <h3>Add New Trial Exam</h3>
            <form onSubmit={handleAddTrial}>
              <div className={styles['form-group']}>
                <label>Student ID:</label>
                <input
                  type="number"
                  value={newTrial.studentId}
                  onChange={(e) => setNewTrial({...newTrial, studentId: e.target.value})}
                  required
                />
              </div>
              <div className={styles['form-group']}>
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
              <div className={styles['form-group']}>
                <label>Exam Date:</label>
                <input
                  type="date"
                  value={newTrial.examDate}
                  onChange={(e) => setNewTrial({...newTrial, examDate: e.target.value})}
                  required
                />
              </div>
              <div className={styles['form-group']}>
                <label>Exam Time:</label>
                <input
                  type="time"
                  value={newTrial.examTime}
                  onChange={(e) => setNewTrial({...newTrial, examTime: e.target.value})}
                  required
                />
              </div>
              <div className={styles['modal-actions']}>
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit">Add Trial</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Update Trial Modal */}
      {showUpdateModal && selectedStudent && (
        <div className={styles['modal-overlay']}>
          <div className={styles['add-modal']}>
            <h3>Update Trial Exam</h3>
            <div className={styles['student-info-modal']}>
              <p>
                <strong>{selectedStudent.first_name} {selectedStudent.last_name}</strong> - {selectedStudent.vehicle_type}
              </p>
            </div>
            <form onSubmit={handleUpdateTrial}>
              <div className={styles['form-group']}>
                <label>Exam Date:</label>
                <input
                  type="date"
                  value={updateData.examDate}
                  onChange={(e) => setUpdateData({...updateData, examDate: e.target.value})}
                  required
                />
              </div>
              <div className={styles['form-group']}>
                <label>Exam Time:</label>
                <input
                  type="time"
                  value={updateData.examTime}
                  onChange={(e) => setUpdateData({...updateData, examTime: e.target.value})}
                  required
                />
              </div>
              <div className={styles['form-group']}>
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
              <div className={styles['form-group']}>
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
              <div className={styles['modal-actions']}>
                <button 
                  type="button" 
                  onClick={() => setShowUpdateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit">Update Trial</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrialExamStudents;