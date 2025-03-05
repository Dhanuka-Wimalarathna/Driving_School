import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = () => setShowModal(true);

  const handleNavigation = (path) => {
    handleCloseModal();
    navigate(path);
  };

  return (
    <div className="home-container">
  <nav className="navbar navbar-expand-lg navbar-light bg-light px-4">
    <a className="navbar-brand fs-3 fw-bold" href="/">
      <img src="/images/icon02.png" alt="Madushani Driving School Logo" className="me-2" />
      Madushani Driving School
    </a>
  </nav>

      <header className="hero-section text-center text-white">
        <div className="container">
          <h1 className="display-4">Learn to Drive with Confidence</h1>
          <p className="lead">Professional driving lessons with expert instructors.</p>
          <button className="btn btn-lg btn-warning mt-3" onClick={handleShowModal}>
            Get Started
          </button>
        </div>
      </header>

      {/* Sign In/Sign Up Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Get Started</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <div className="d-grid gap-3">
            <Button 
              variant="outline-primary" 
              size="lg"
              onClick={() => handleNavigation('/login')}
            >
              Sign In
            </Button>
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => handleNavigation('/signup')}
            >
              Create New Account
            </Button>
          </div>
        </Modal.Body>
      </Modal>

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