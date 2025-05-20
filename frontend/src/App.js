import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Student/Home';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import StudentHome from './pages/Student/Home';
import Dashboard from './pages/Student/Dashboard';
import Booking from './pages/Student/Booking';
import Progress from './pages/Student/Progress';
import Payments from './pages/Student/Payments';
import ResetPasswordForm from './pages/Auth/ResetPassword/ResetPasswordForm';
import OTPVerificationForm from './pages/Auth/ResetPassword/OTPVerificationForm';
import Package from './pages/Student/Package';
import ProfilePage from './pages/Student/ProfilePage';
import StudyMaterials from './pages/Student/StudyMaterials';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Home Page (First Page Users See) */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path='/reset-password' element={<ResetPasswordForm />} />
          <Route path='/reset-password/otp-verification' element={<OTPVerificationForm />} />

          {/* Student Routes */}
          <Route path="/student" element={<Dashboard />} />
          <Route path="/student/home" element={<StudentHome />} />
          <Route path="/student/package" element={<Package />} />
          <Route path="/student/progress" element={<Progress />} />
          <Route path="/student/payments" element={<Payments />} />
          <Route path="/student/booking" element={<Booking />} />
          <Route path="/student/profile" element={<ProfilePage />} />
          <Route path="/student/study-materials" element={<StudyMaterials />} />

          {/* Redirect any unknown route to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;