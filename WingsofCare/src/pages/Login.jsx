  // Modified Login.js with redirect to the previous page
  import React, { useState } from 'react';
  import { useNavigate, Link, useLocation } from 'react-router-dom';
  import { useAuth } from '../components/AuthContext';
  import "../css/Login.css";

  const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Get the page the user was trying to access before being redirected to login
    const from = location.state?.from?.pathname || '/';
    
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      try {
        setError('');
        await login(email, password);
        // Redirect to the page they were trying to access, or home if there was none
        navigate(from);
      } catch (err) {
        console.error("Login error:", err);
        setError(err.response?.data?.message || 'Failed to log in');
      }
    };
    
    return (
      <div className="d-flex vh-100 bg-light justify-content-center align-items-center">
        <div className="w-100" style={{ maxWidth: '400px' }}>
          <div className="card">
            <div className="card-body">
              <h2 className="text-center mb-4">Log In</h2>
              
              {error && <div className="alert alert-danger">{error}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="btn btn-primary w-100 mt-3"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Log In'}
                </button>
              </form>
              
              <div className="text-center mt-3">
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-2">
            Need an account? <Link to="/register">Sign Up</Link>
          </div>
        </div>
      </div>
    );
  };

  export default Login;