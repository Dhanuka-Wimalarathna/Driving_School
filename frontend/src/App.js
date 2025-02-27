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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Home Page (First Page Users See) */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Student Routes */}
          <Route path="/student" element={<Dashboard />} />
          <Route path="/student/home" element={<StudentHome />} />
          <Route path="/student/booking" element={<Booking />} />
          <Route path="/student/progress" element={<Progress />} />
          <Route path="/student/payments" element={<Payments />} />

          {/* Redirect any unknown route to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;