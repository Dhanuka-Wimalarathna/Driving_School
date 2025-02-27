import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LessonCard from '../../components/Student/LessonCard';
import Sidebar from '../../components/Sidebar'; // Import Sidebar component
import 'bootstrap/dist/css/bootstrap.min.css';
import './Dashboard.css';
import '../../components/Sidebar.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [upcomingLessons] = React.useState([
    { 
      id: 1, 
      date: "2023-10-05", 
      instructor: "Mr. Smith", 
      vehicle: "Toyota Corolla", 
      status: "Upcoming" 
    },
  ]);

  const handleBookLesson = () => {
    navigate('/student/booking');
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 sidebar-container">
          <Sidebar />
        </div>

        {/* Main content */}
        <div className="col-md-9 main-content p-4">
          <div className="dashboard container-fluid">
            <div className="row justify-content-center">
              <div className="col-lg-10">
                <h1 className="welcome-header display-4 mb-4">
                  Welcome back, {user?.name || 'Student'} 👋
                </h1>

                {/* Student Details Section */}
                <div className="student-details">
                  <h2 className="h5 mb-3 text-secondary">Student Details</h2>
                  <div className="student-info">
                    <p><strong>Name:</strong> {user?.name || 'John Doe'}</p>
                    <p><strong>Email:</strong> {user?.email || 'john.doe@example.com'}</p>
                    <p><strong>Phone:</strong> {user?.phone || '123-456-7890'}</p>
                    <p><strong>License Type:</strong> {user?.licenseType || 'Class B'}</p>
                  </div>
                </div>

                <h2 className="h4 mb-3 text-primary">Upcoming Lessons</h2>
                <div className="lesson-grid">
                  {upcomingLessons.map((lesson) => (
                    <LessonCard 
                      key={lesson.id} 
                      lesson={lesson} 
                      className="lesson-card p-4"
                    />
                  ))}
                </div>

                <div className="mt-4 text-center">
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
