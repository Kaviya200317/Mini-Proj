import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import axios from 'axios';
import '../css/Profile.css';

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Fetch user profile and payment history when component mounts
    fetchUserProfile();
    fetchPaymentHistory();
  }, []);

  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setErrorMessage('Authentication token not found. Please login again.');
        return;
      }

      const response = await axios.get('http://localhost:3001/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setUserProfile({
          name: response.data.user.name || '',
          email: response.data.user.email || '',
          phone: response.data.user.phone || '',
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setErrorMessage('Failed to load profile information. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await axios.get('http://localhost:3001/api/payment-history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setPaymentHistory(response.data.payments);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserProfile(prevProfile => ({
      ...prevProfile,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setErrorMessage('Authentication token not found. Please login again.');
        return;
      }

      const response = await axios.put(
        'http://localhost:3001/api/user/profile',
        userProfile,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setSuccessMessage('Profile updated successfully!');
        setIsEditing(false);
        
        // Small delay to show success message before resetting
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        setErrorMessage(response.data.message || 'Failed to update profile.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage('Failed to update profile. Please try again later.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTotalContribution = () => {
    return paymentHistory
      .filter(payment => payment.status === 'completed')
      .reduce((total, payment) => total + payment.amount, 0);
  };

  if (isLoading) {
    return (
      <div className="profile-loading">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading profile information...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>My Profile</h2>
        <div className="profile-tabs">
          <button 
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile Information
          </button>
          <button 
            className={`tab-button ${activeTab === 'contributions' ? 'active' : ''}`}
            onClick={() => setActiveTab('contributions')}
          >
            Contribution History
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="alert alert-danger">{errorMessage}</div>
      )}
      
      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}

      {activeTab === 'profile' && (
        <div className="profile-content">
          <div className="profile-section">
            <div className="profile-details">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={userProfile.name}
                      onChange={handleInputChange}
                      required
                    />
                  ) : (
                    <p className="profile-value">{userProfile.name || 'Not provided'}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <p className="profile-value">{userProfile.email}</p>
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      className="form-control"
                      value={userProfile.phone}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p className="profile-value">{userProfile.phone || 'Not provided'}</p>
                  )}
                </div>

                {isEditing ? (
                  <div className="profile-actions">
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="profile-actions">
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={() => logout()}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'contributions' && (
        <div className="contributions-section">
          <div className="contribution-summary">
            <div className="summary-card">
              <h4>Total Contributions</h4>
              <p className="summary-value">₹{calculateTotalContribution().toFixed(2)}</p>
            </div>
            <div className="summary-card">
              <h4>Total Payments</h4>
              <p className="summary-value">{paymentHistory.filter(p => p.status === 'completed').length}</p>
            </div>
          </div>

          <div className="payment-history">
            <h3>Payment History</h3>
            {paymentHistory.length === 0 ? (
              <div className="no-data">
                <p>You haven't made any contributions yet.</p>
                <a href="/contribute/sponsor" className="btn btn-primary">Contribute Now</a>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Item</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map(payment => (
                      <tr key={payment._id}>
                        <td>{formatDate(payment.timestamp || payment.created_at)}</td>
                        <td>{payment.item_name}</td>
                        <td>₹{payment.amount.toFixed(2)}</td>
                        <td>
                          <span className={`badge ${
                            payment.status === 'completed' ? 'bg-success' :
                            payment.status === 'failed' ? 'bg-danger' :
                            'bg-warning'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;