import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminSignIn from './components/Auth/AdminSignIn';
import AdminSignUp from './components/Auth/AdminSignUp';
import Dashboard from './pages/Dashboard';
import Packages from './pages/Packages';
import 'bootstrap/dist/css/bootstrap.min.css';
import FirstPage from './components/Auth/FirstPage';
import InstructorSignIn from './components/Auth/InstrutorSignIn';
import InstructorSignUp from './components/Auth/InstructorSignUp';
import Vehicles from './pages/Vehicles';
import Instructor from './pages/Instructor';
import Students from './pages/Students';
import StudentDetails from './pages/StudentDetails';
import InstructorDashboard from './instructor/InstructorDashboard';
import InstructorVehicles from './instructor/InstructorVehicles';
import InstructorStudents from './instructor/InstructorStudents';
import InstructorSchedule from './instructor/InstructorSchedule';                                     
import MarkProgress from './instructor/MarkProgress';
import PaymentPage from './pages/Payments';

function App() {
  return (
    <Router>
      <Routes>
        {/* First Page (Welcome Page) */}
        <Route path="/" element={<FirstPage/>} />

        {/* Authentication Pages */}
        <Route path="/admin/sign-in" element={<AdminSignIn />} />
        <Route path="/admin/sign-up" element={<AdminSignUp />} />
        <Route path="/instructor/sign-in" element={<InstructorSignIn />} />
        <Route path="/instructor/sign-up" element={<InstructorSignUp/>} />
        
        {/* Admin Pages */}
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/package" element={<Packages />} />
        <Route path="/admin/vehicles" element={<Vehicles />} />
        <Route path="/admin/instructors" element={<Instructor />} />
        <Route path="/admin/students" element={<Students />} />
        <Route path='/admin/students/:id' element={<StudentDetails />} />
        <Route path="/admin/payments" element={<PaymentPage />} />

        {/* Instructor Pages */}
        <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
        <Route path="/instructor/vehicles" element={<InstructorVehicles />} />
        <Route path="/instructor/students" element={<InstructorStudents />} />
        <Route path="/instructor/schedule" element={<InstructorSchedule />} />
        <Route path="/instructor/students/:id" element={<MarkProgress />} />
      </Routes>
    </Router>
  );
}

export default App;
