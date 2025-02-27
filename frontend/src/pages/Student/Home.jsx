import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <nav className="navbar navbar-expand-lg navbar-light bg-light px-4">
        <a className="navbar-brand fs-3 fw-bold" href="/">
          <i className="bi bi-car-front me-2"></i> Madushani Driving School
        </a>
        <div className="ms-auto">
          <button className="btn btn-outline-primary me-2" onClick={() => navigate('/login')}>Sign In</button>
          <button className="btn btn-primary" onClick={() => navigate('/signup')}>Sign Up</button>
        </div>
      </nav>

      <header className="hero-section text-center text-white">
        <div className="container">
          <h1 className="display-4">Learn to Drive with Confidence</h1>
          <p className="lead">Professional driving lessons with expert instructors.</p>
          <button className="btn btn-lg btn-warning mt-3" onClick={() => navigate('/signup')}>
            Get Started
          </button>
        </div>
      </header>

      <section className="about-section py-5">
        <div className="container">
          <h2 className="text-center">Why Choose Us?</h2>
          <div className="row mt-4">
            <div className="col-md-4 text-center">
              <i className="bi bi-person-check fs-1 text-primary"></i>
              <h4>Experienced Instructors</h4>
              <p>Our certified instructors ensure safe and professional training.</p>
            </div>
            <div className="col-md-4 text-center">
              <i className="bi bi-calendar-check fs-1 text-primary"></i>
              <h4>Flexible Scheduling</h4>
              <p>Book lessons at your convenience, including weekends.</p>
            </div>
            <div className="col-md-4 text-center">
              <i className="bi bi-car-front fs-1 text-primary"></i>
              <h4>Modern Vehicles</h4>
              <p>Learn in safe, well-maintained cars equipped with dual controls.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer bg-dark text-white text-center py-3">
        <p>© 2025 Madushani Driving School. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
