import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminSignIn from './components/Auth/AdminSignIn';
import AdminSignUp from './components/Auth/AdminSignUp';
import InstructorSignIn from './components/Auth/InstrutorSignIn';
import InstructorSignUp from './components/Auth/InstructorSignUp';
import FirstPage from './components/Auth/FirstPage';
import Dashboard from './pages/admin/Dashboard/Dashboard';
import Packages from './pages/admin/Packages/Packages';
import Vehicles from './pages/admin/Vehicles/Vehicles';
import Instructor from './pages/admin/Instructor/Instructor';
import Students from './pages/admin/Students/Students';
import StudentDetails from './pages/admin/StudentDetails/StudentDetails';
import TrialExamStudents from './pages/admin/TrialExamStudents/TrialExamStudents';
import Payments from './pages/admin/Payments/Payments';
import FinancialReport from './components/FinancialReport/FinancialReport';
import StudyMaterials from './pages/admin/StudyMaterials/StudyMaterials';

import InstructorDashboard from './pages/instructor/InstructorDashboard/InstructorDashboard';
import InstructorVehicles from './pages/instructor/InstructorVehicles/InstructorVehicles';
import InstructorStudents from './pages/instructor/InstructorStudents/InstructorStudents';
import InstructorSchedule from './pages/instructor/InstructorSchedule/InstructorSchedule';      
import MarkProgress from './pages/instructor/MarkProgress/MarkProgress';
import InstructorProfile from './pages/instructor/Profile/InstructorProfile';
import DailyReport from './pages/instructor/DailyReport/DailyReport';

import 'bootstrap/dist/css/bootstrap.min.css';

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
        <Route path="/admin/payments" element={<Payments />} />
        <Route path="/trial-exam-students" element={<TrialExamStudents />} />
        <Route path="/admin/financial-reports" element={<FinancialReport />} />
        <Route path="/admin/study-materials" element={<StudyMaterials />} />

        {/* Instructor Pages */}
        <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
        <Route path="/instructor/vehicles" element={<InstructorVehicles />} />
        <Route path="/instructor/students" element={<InstructorStudents />} />
        <Route path="/instructor/schedule" element={<InstructorSchedule />} />
        <Route path="/instructor/students/:id" element={<MarkProgress />} />
        <Route path="/instructor/profile" element={<InstructorProfile />} />
        <Route path="/instructor/daily-report" element={<DailyReport />} />
      </Routes>
    </Router>
  );
}

export default App;
