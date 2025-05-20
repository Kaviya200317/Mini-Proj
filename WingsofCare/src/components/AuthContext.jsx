
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false); // Added isAdmin state

  // Hardcoded API URL - replace with your actual backend URL
  const API_URL = 'http://localhost:3001/api';

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        // Get token from local storage
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
          // Set default authorization header for all requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Parse stored user data
          const parsedUserData = JSON.parse(userData);
          
          // Set current user
          setCurrentUser(parsedUserData);
          
          // Set admin status
          setIsAdmin(parsedUserData.isAdmin === true);
        }
      } catch (error) {
        // If token is invalid, clear it
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        axios.defaults.headers.common['Authorization'] = '';
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkLoggedIn();
  }, []);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    
    try {
      console.log("Attempting login to:", `${API_URL}/auth/login`);
      console.log("Login payload:", { email, password: "***" });
      
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });
      
      console.log("Login response:", response.data);
      
      // Store token in local storage
      const { token } = response.data;
      const user = {
        id: response.data.id,
        name: response.data.name,
        email: response.data.email,
        isAdmin: response.data.isAdmin // Store isAdmin from response
      };
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(user));
      
      // Set default headers for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update user state and admin status
      setCurrentUser(user);
      setIsAdmin(user.isAdmin === true);
      setAuthError('');
      return user;
    } catch (error) {
      console.log("Login error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // Enhanced error handling
      if (error.response) {
        // The server responded with an error
        throw error;
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response received from server. Check your connection.');
      } else {
        // Something happened in setting up the request
        throw new Error('Request failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    axios.defaults.headers.common['Authorization'] = '';
    setCurrentUser(null);
    setIsAdmin(false); // Reset admin status on logout
  };

  // Registration function
  const register = async (name, email, password) => {
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password
      });
      
      // Login after successful registration
      await login(email, password);
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Check if user is admin
  const checkAdminStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/check-admin`);
      setIsAdmin(response.data.isAdmin === true);
      return response.data.isAdmin;
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
      return false;
    }
  };

  // Password reset request
  const requestPasswordReset = async (email) => {
    try {
      await axios.post(`${API_URL}/auth/reset-password`, { email });
      return true;
    } catch (error) {
      throw error;
    }
  };

  // Complete password reset with token
  const resetPassword = async (token, newPassword) => {
    try {
      await axios.post(`${API_URL}/auth/reset-password/${token}`, { 
        password: newPassword 
      });
      return true;
    } catch (error) {
      throw error;
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    setLoading(true);
    
    try {
      const response = await axios.put(`${API_URL}/users/me`, userData);
      
      // Update localStorage with new user data
      const updatedUser = {
        ...currentUser,
        ...response.data,
        isAdmin: response.data.isAdmin || currentUser.isAdmin // Preserve isAdmin if not in response
      };
      
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      
      setCurrentUser(updatedUser);
      setIsAdmin(updatedUser.isAdmin === true);
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    authError,
    isAdmin, // Expose isAdmin to consumers
    login,
    logout,
    register,
    checkAdminStatus, // Expose function to check admin status
    requestPasswordReset,
    resetPassword,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}