import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
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
      {/* Modern Navbar with transparent background */}
      <nav className="navbar navbar-expand-lg navbar-dark fixed-top py-3 transition-navbar">
        <div className="container">
          <a className="navbar-brand d-flex align-items-center" href="/">
            <img src="/images/icon02.png" alt="Madushani Driving School Logo" className="me-2 logo-img" />
            <span className="brand-text">Madushani Driving School</span>
          </a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <a className="nav-link" href="#about">About</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#services">Services</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#testimonials">Testimonials</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#contact">Contact</a>
              </li>
              <li className="nav-item ms-2">
                <button className="btn btn-primary-outline btn-sm" onClick={() => handleNavigation('/login')}>
                  Log In
                </button>
              </li>
              <li className="nav-item ms-2">
                <button className="btn btn-primary btn-sm" onClick={() => handleNavigation('/signup')}>
                  Sign Up
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section with Background Image instead of Video */}
      <header className="hero-section text-white" id="home">
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          <div className="row">
            <div className="col-lg-7">
              <h1 className="display-3 fw-bold">Drive With Confidence</h1>
              <p className="lead my-4">Professional driving lessons tailored to your needs with certified instructors. Take the first step towards freedom on the road.</p>
              <div className="d-flex gap-3">
                <button className="btn btn-primary btn-lg" onClick={handleShowModal}>
                  Get Started
                </button>
                <a href="#services" className="btn btn-outline-light btn-lg">
                  Our Services
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sign In/Sign Up Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="mx-auto">Join Madushani Driving School</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 py-4">
          <div className="d-grid gap-3">
            <button 
              className="btn btn-outline-primary btn-lg py-3"
              onClick={() => handleNavigation('/login')}
            >
              Sign In
            </button>
            <button 
              className="btn btn-primary btn-lg py-3"
              onClick={() => handleNavigation('/signup')}
            >
              Create New Account
            </button>
          </div>
          <div className="text-center mt-4">
            <p className="text-muted">By signing up, you agree to our Terms and Privacy Policy</p>
          </div>
        </Modal.Body>
      </Modal>

      {/* Features Section */}
      <section className="features-section py-5" id="about">
        <div className="container">
          <div className="section-header text-center mb-5">
            <span className="subtitle">Our Advantages</span>
            <h2>Why Students Choose Us</h2>
            <div className="section-divider"></div>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="bi bi-shield-check"></i>
                </div>
                <h4>Certified Instructors</h4>
                <p>Learn from professionals with years of experience and perfect safety records.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="bi bi-calendar-check"></i>
                </div>
                <h4>Flexible Scheduling</h4>
                <p>Book lessons that fit your busy schedule including evenings and weekends.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="bi bi-car-front"></i>
                </div>
                <h4>Modern Vehicles</h4>
                <p>Train in comfortable, dual-control cars equipped with the latest safety features.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section py-5" id="services">
        <div className="container">
          <div className="section-header text-center mb-5">
            <span className="subtitle">What We Offer</span>
            <h2>Our Training Programs</h2>
            <div className="section-divider"></div>
          </div>
          <div className="row g-4">
            <div className="col-lg-4 col-md-6">
              <div className="service-card">
                <div className="service-image">
                  <div className="placeholder-image beginner-img"></div>
                  <div className="service-overlay">
                    <button className="btn btn-primary" onClick={handleShowModal}>Learn More</button>
                  </div>
                </div>
                <div className="service-content">
                  <h4>Beginner Course</h4>
                  <p>Perfect for first-time drivers with no previous experience.</p>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="service-card">
                <div className="service-image">
                  <div className="placeholder-image advanced-img"></div>
                  <div className="service-overlay">
                    <button className="btn btn-primary" onClick={handleShowModal}>Learn More</button>
                  </div>
                </div>
                <div className="service-content">
                  <h4>Advanced Driving</h4>
                  <p>For licensed drivers looking to enhance their skills and confidence.</p>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="service-card">
                <div className="service-image">
                  <div className="placeholder-image test-img"></div>
                  <div className="service-overlay">
                    <button className="btn btn-primary" onClick={handleShowModal}>Learn More</button>
                  </div>
                </div>
                <div className="service-content">
                  <h4>Test Preparation</h4>
                  <p>Focused training to help you pass your driving test on the first attempt.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section py-5" id="testimonials">
        <div className="container">
          <div className="section-header text-center mb-5">
            <span className="subtitle">Success Stories</span>
            <h2>What Our Students Say</h2>
            <div className="section-divider"></div>
          </div>
          <div className="row">
            <div className="col-md-4">
              <div className="testimonial-card">
                <div className="testimonial-avatar">
                  <div className="avatar-placeholder avatar-1"></div>
                </div>
                <div className="testimonial-content">
                  <div className="testimonial-rating">★★★★★</div>
                  <p>"I was terrified of driving but my instructor made me feel so comfortable. Passed my test on the first try!"</p>
                  <h5>Sarah M.</h5>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="testimonial-card">
                <div className="testimonial-avatar">
                  <div className="avatar-placeholder avatar-2"></div>
                </div>
                <div className="testimonial-content">
                  <div className="testimonial-rating">★★★★★</div>
                  <p>"The flexible scheduling allowed me to take lessons around my busy work hours. Highly recommend!"</p>
                  <h5>David L.</h5>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="testimonial-card">
                <div className="testimonial-avatar">
                  <div className="avatar-placeholder avatar-3"></div>
                </div>
                <div className="testimonial-content">
                  <div className="testimonial-rating">★★★★★</div>
                  <p>"After failing twice with another school, I switched to Madushani and passed easily. Wish I'd started here!"</p>
                  <h5>Emma T.</h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section py-5" id="contact">
        <div className="container">
          <div className="section-header text-center mb-5">
            <span className="subtitle">Get In Touch</span>
            <h2>Contact Us</h2>
            <div className="section-divider"></div>
          </div>
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="contact-info">
                <div className="info-item">
                  <div className="info-icon">
                    <i className="bi bi-telephone"></i>
                  </div>
                  <div>
                    <h5>Call Us</h5>
                    <p>(123) 456-7890</p>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-icon">
                    <i className="bi bi-envelope"></i>
                  </div>
                  <div>
                    <h5>Email</h5>
                    <p>info@madushanidriving.com</p>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-icon">
                    <i className="bi bi-geo-alt"></i>
                  </div>
                  <div>
                    <h5>Location</h5>
                    <p>123 Driving Street, City, State</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-8">
              <div className="contact-form-container">
                <form className="contact-form">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <input type="text" className="form-control" placeholder="Your Name" required />
                    </div>
                    <div className="col-md-6">
                      <input type="email" className="form-control" placeholder="Your Email" required />
                    </div>
                    <div className="col-12">
                      <input type="text" className="form-control" placeholder="Subject" />
                    </div>
                    <div className="col-12">
                      <textarea className="form-control" rows="5" placeholder="Your Message" required></textarea>
                    </div>
                    <div className="col-12">
                      <button type="submit" className="btn btn-primary btn-lg">Send Message</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-5">
        <div className="container text-center">
          <h2 className="text-white mb-4">Ready to Start Your Driving Journey?</h2>
          <button className="btn btn-light btn-lg" onClick={handleShowModal}>Book Your First Lesson</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer py-4">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4">
              <a className="footer-brand d-flex align-items-center mb-3" href="/">
                <img src="/images/icon02.png" alt="Madushani Driving School Logo" className="me-2 logo-img-sm" />
                <span className="footer-brand-text">Madushani Driving School</span>
              </a>
              <p>Professional driving instruction focused on creating safe, confident drivers for life.</p>
            </div>
            <div className="col-lg-2 col-md-3 col-6">
              <h5>Quick Links</h5>
              <ul className="footer-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#testimonials">Testimonials</a></li>
              </ul>
            </div>
            <div className="col-lg-2 col-md-3 col-6">
              <h5>Programs</h5>
              <ul className="footer-links">
                <li><a href="#services">Beginner Course</a></li>
                <li><a href="#services">Advanced Driving</a></li>
                <li><a href="#services">Test Preparation</a></li>
                <li><a href="#services">Refresher Lessons</a></li>
              </ul>
            </div>
            <div className="col-lg-4 col-md-6">
              <h5>Newsletter</h5>
              <p>Subscribe for driving tips and special offers</p>
              <div className="newsletter-form">
                <input type="email" className="form-control" placeholder="Your Email" />
                <button type="submit" className="btn btn-primary">Subscribe</button>
              </div>
            </div>
          </div>
          <hr className="footer-divider" />
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <p className="mb-0">© 2025 Madushani Driving School. All rights reserved.</p>
            <div className="social-links">
              <a href="#" className="social-link"><i className="bi bi-facebook"></i></a>
              <a href="#" className="social-link"><i className="bi bi-instagram"></i></a>
              <a href="#" className="social-link"><i className="bi bi-twitter"></i></a>
              <a href="#" className="social-link"><i className="bi bi-youtube"></i></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;