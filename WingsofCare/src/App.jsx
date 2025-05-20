// Modified App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom';
import GroceryList from './Contribute/GroceryList'; 
import AddItem from './Contribute/AddItem'; 
import UpdateItem from './Contribute/updateList'; 
import Home from './Home/Home'; 
import Contribute from './Home/Contribute';
import SponsorChild from './Contribute/SponsorChild';
import Provisions from './Contribute/Provisions';
import Profile from './Home/Profile';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './App.css';
import { AuthProvider, useAuth } from './components/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import About from './Home/About';

const Navigation = () => {
  const { currentUser, logout } = useAuth();
  
  return (
    <nav className="navbar">
      <div className="logo">
        <h1>WingsofCare</h1>
      </div>
      <div className="nav-links">
        <NavLink to="/" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Home</NavLink>
        <NavLink to="/about" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>About Us</NavLink>
        
        {currentUser && (
          <>
            <div className="dropdown">
              <button className="nav-link dropdown-button">Contribute</button>
              <div className="dropdown-content">
                <Link to="/contribute/sponsor" className="dropdown-item">Sponsor a Child</Link>
                <Link to="/contribute/provisions" className="dropdown-item">Provisions</Link>
                {/* <Link to="/contribute/grocery" className="dropdown-item">Grocery List</Link> */}
              </div>
            </div>
            <NavLink to="/profile" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Profile</NavLink>
          </>
        )}
        

        <NavLink to="/contact" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Contact</NavLink>
        
        {currentUser ? (
          <>
            <span className="welcome-text">Welcome, {currentUser.name || currentUser.email}</span>
            <button onClick={logout} className="nav-link highlight">Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={({isActive}) => isActive ? (isActive ? "nav-link highlight active" : "nav-link highlight") : "nav-link highlight"}>Login</NavLink>
            <NavLink to="/register" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Register</NavLink>
          </>
        )}
      </div>
    </nav>
  );
};

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>WingsofCare</h3>
          <p>Empowering children through care, education, and love since 2009.</p>
        </div>
        <div className="footer-section">
          <h3>Contact Us</h3>
          <p>123 Care Street, Bangalore, Karnataka</p>
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
  );
};


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navigation />
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contribute" element={
              <ProtectedRoute>
                <Contribute />
              </ProtectedRoute>
            } />
            <Route path="/contribute/grocery" element={
              <ProtectedRoute>
                <GroceryList />
              </ProtectedRoute>
            } />
            <Route path="/contribute/grocery/create" element={
              <ProtectedRoute>
                <AddItem />
              </ProtectedRoute>
            } />
            <Route path="/contribute/grocery/update/:id" element={
              <ProtectedRoute>
                <UpdateItem />
              </ProtectedRoute>
            } />
            <Route path="/contribute/sponsor" element={
              <ProtectedRoute>
                <SponsorChild />
              </ProtectedRoute>
            } />
            <Route path="/contribute/provisions" element={
              <ProtectedRoute>
                <Provisions />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
             <Route path="/about" element={<About />} />
          </Routes>
        </div>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;