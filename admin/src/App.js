import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SignIn from './components/Auth/SignIn';
import SignUp from './components/Auth/SignUp';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <div className="container mt-5">
        <h1>Welcome to the Admin Panel</h1>
        <div className="mt-4">
          <Link to="/sign-in" className="btn btn-primary me-2">
            Sign In
          </Link>
          <Link to="/sign-up" className="btn btn-success">
            Sign Up
          </Link>
        </div>
      </div>

      <Routes>
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
      </Routes>
    </Router>
  );
}

export default App;