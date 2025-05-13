import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Home.css'; // Import the CSS file
import { useAuth } from '../components/AuthContext';

const Home = () => {
  const { currentUser } = useAuth();

  return (
    <div className="home-container">
      {/* Navigation Bar */}
     

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>Providing Hope and Care for Every Child</h1>
          <p>Creating a nurturing environment for children to thrive and reach their full potential</p>
          <div className="hero-buttons">
            <Link to="/donate" className="btn primary-btn">Donate Now</Link>
            <Link to="/volunteer" className="btn secondary-btn">Volunteer</Link>
          </div>
        </div>
      </div>

      {/* Mission Statement */}
      <section className="mission-section">
        <div className="section-container">
          <h2>Our Mission</h2>
          <p>At WingsofCare, we believe every child deserves love, security, and opportunities to grow. 
            We're dedicated to providing safe homes, quality education, and emotional support to orphaned 
            and vulnerable children, helping them build brighter futures.</p>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="impact-section">
        <div className="section-container">
          <h2>Our Impact</h2>
          <div className="stats-container">
            <div className="stat-card">
              <h3>250+</h3>
              <p>Children Supported</p>
            </div>
            <div className="stat-card">
              <h3>15</h3>
              <p>Years of Service</p>
            </div>
            <div className="stat-card">
              <h3>98%</h3>
              <p>Education Completion</p>
            </div>
            <div className="stat-card">
              <h3>175</h3>
              <p>Community Volunteers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Overview */}
      <section className="programs-section">
        <div className="section-container">
          <h2>Our Programs</h2>
          <div className="program-cards">
            <div className="program-card">
              <div className="program-icon education-icon"></div>
              <h3>Education Support</h3>
              <p>Quality schooling, tutoring, and resources to help our children excel academically.</p>
            </div>
            <div className="program-card">
              <div className="program-icon health-icon"></div>
              <h3>Healthcare</h3>
              <p>Comprehensive medical care, nutrition, and wellness programs for all children.</p>
            </div>
            <div className="program-card">
              <div className="program-icon skills-icon"></div>
              <h3>Life Skills</h3>
              <p>Teaching independence, confidence, and practical skills for future success.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="testimonial-section">
        <div className="section-container">
          <h2>Success Stories</h2>
          <div className="testimonial-card">
            <p>"WingsofCare changed my life completely. They not only provided me with shelter and education but also with love and confidence to pursue my dreams. Today, I am a college graduate working as a software engineer."</p>
            <h4>- Ravi Kumar, Former Resident</h4>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="cta-section">
        <div className="section-container">
          <h2>Make a Difference Today</h2>
          <p>Your support can help provide care, education, and opportunities for children in need.</p>
          <div className="cta-buttons">
            <Link to="/donate" className="btn primary-btn">Donate Now</Link>
            <Link to="/contact" className="btn secondary-btn">Get Involved</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>WingsofCare</h3>
            <p>Empowering children through care, education, and love since 2009.</p>
          </div>
          <div className="footer-section">
            <h3>Contact Us</h3>
            <p>123 Care Street, Coimbatore, TamilNadu </p>
            <p>Phone: +91 98765 43210</p>
            <p>Email: info@wingsofcare.org</p>
          </div>
          <div className="footer-section">
            <h3>Follow Us</h3>
            <div className="social-links">
              <a href="#" className="social-icon facebook-icon">Facebook</a>
              <a href="#" className="social-icon instagram-icon">Instagram</a>
              <a href="#" className="social-icon twitter-icon">Twitter</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 WingsofCare. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;