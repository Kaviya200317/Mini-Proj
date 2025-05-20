import React from 'react';
import { Link } from 'react-router-dom';
import '../css/About.css'; // You'll need to create this CSS file
import { useAuth } from '../components/AuthContext';

const About = () => {
  const { currentUser } = useAuth();

  return (
    <div className="about-container">
      {/* Hero Section */}
      <div className="about-hero-section">
        <div className="hero-content">
          <h1>About WingsofCare</h1>
          <p>Dedicated to transforming the lives of orphaned and vulnerable children since 2009</p>
        </div>
      </div>

      {/* Our Story Section */}
      <section className="story-section">
        <div className="section-container">
          <h2>Our Story</h2>
          <div className="story-content">
            <div className="story-text">
              <p>WingsofCare was founded in 2009 by Mrs. Priya Sharma, a former teacher who witnessed firsthand the struggles of orphaned children in her community. What began as a small initiative to provide shelter for 12 homeless children has grown into a comprehensive support system for over 250 children across Tamil Nadu.</p>
              <p>The name "WingsofCare" represents our belief that proper care and support can give children the wings they need to soar above their circumstances and achieve their dreams. For more than 15 years, we've been committed to providing not just basic necessities, but also the emotional support, education, and life skills needed for children to thrive.</p>
            </div>
            <div className="story-image">
              {/* Placeholder for founder's image */}
              <div className="founder-image"></div>
              <p className="image-caption">Mrs. Priya Sharma, Founder</p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision and Values Section */}
      <section className="vision-section">
        <div className="section-container">
          <div className="vision-values-container">
            <div className="vision-box">
              <h2>Our Vision</h2>
              <p>A world where every child has access to care, education, and opportunities to reach their full potential, regardless of their circumstances.</p>
            </div>
            <div className="values-box">
              <h2>Our Values</h2>
              <ul className="values-list">
                <li><span>Compassion</span>: Treating each child with genuine care and understanding</li>
                <li><span>Integrity</span>: Operating with transparency and accountability in all we do</li>
                <li><span>Empowerment</span>: Building independence and confidence in every child</li>
                <li><span>Equality</span>: Ensuring all children receive equal opportunities and respect</li>
                <li><span>Excellence</span>: Striving for the highest quality of care and education</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Approach Section */}
      <section className="approach-section">
        <div className="section-container">
          <h2>Our Approach</h2>
          <div className="approach-content">
            <div className="approach-card">
              <div className="approach-icon holistic-icon"></div>
              <h3>Holistic Development</h3>
              <p>We focus on nurturing the physical, emotional, intellectual, and social development of each child in our care.</p>
            </div>
            <div className="approach-card">
              <div className="approach-icon personalized-icon"></div>
              <h3>Personalized Care</h3>
              <p>Each child receives individualized attention and support tailored to their unique needs and aspirations.</p>
            </div>
            <div className="approach-card">
              <div className="approach-icon community-icon"></div>
              <h3>Community Integration</h3>
              <p>We foster connections with the broader community to ensure children develop a sense of belonging and social responsibility.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="section-container">
          <h2>Our Team</h2>
          <p className="team-intro">WingsofCare is powered by a dedicated team of professionals passionate about child welfare. Our staff includes:</p>
          <div className="team-grid">
            <div className="team-member">
              <div className="member-photo director-photo"></div>
              <h3>Rajiv Patel</h3>
              <p>Executive Director</p>
            </div>
            <div className="team-member">
              <div className="member-photo education-photo"></div>
              <h3>Ananya Desai</h3>
              <p>Education Coordinator</p>
            </div>
            <div className="team-member">
              <div className="member-photo health-photo"></div>
              <h3>Dr. Vikram Singh</h3>
              <p>Health Director</p>
            </div>
            <div className="team-member">
              <div className="member-photo counselor-photo"></div>
              <h3>Meera Krishnan</h3>
              <p>Child Counselor</p>
            </div>
          </div>
          <p className="team-support">Supported by a team of 30+ care workers, teachers, and administrative staff who ensure the daily operations run smoothly.</p>
        </div>
      </section>

      {/* Recognition Section */}
      <section className="recognition-section">
        <div className="section-container">
          <h2>Recognition & Partnerships</h2>
          <div className="recognition-content">
            <div className="awards">
              <h3>Awards</h3>
              <ul>
                <li>2023 - Child Welfare Excellence Award, Government of Tamil Nadu</li>
                <li>2021 - Community Impact Award, NGO Council of India</li>
                <li>2018 - Best Practices in Child Care, National Child Rights Commission</li>
              </ul>
            </div>
            <div className="partners">
              <h3>Our Partners</h3>
              <div className="partner-logos">
                {/* Placeholder for partner logos */}
                <div className="partner-logo"></div>
                <div className="partner-logo"></div>
                <div className="partner-logo"></div>
                <div className="partner-logo"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map/Location Section */}
      <section className="location-section">
        <div className="section-container">
          <h2>Visit Us</h2>
          <div className="location-content">
            <div className="location-info">
              <h3>Main Center</h3>
              <p>123 Care Street, Coimbatore, Tamil Nadu - 641001</p>
              <p>Phone: +91 98765 43210</p>
              <p>Email: info@wingsofcare.org</p>
              <p>Open for visitors: Monday-Saturday, 10:00 AM - 4:00 PM</p>
            </div>
            <div className="location-map">
              {/* Placeholder for Google Maps embed */}
              <div className="map-placeholder">
                <p>Google Maps will be embedded here</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="cta-section">
        <div className="section-container">
          <h2>Join Our Mission</h2>
          <p>Become a part of our journey in transforming the lives of children in need.</p>
          <div className="cta-buttons">
            <Link to="/donate" className="btn primary-btn">Support Us</Link>
            <Link to="/contact" className="btn secondary-btn">Contact Us</Link>
          </div>
        </div>
      </section>

      
    </div>
  );
};

export default About;