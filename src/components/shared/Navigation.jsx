import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useNotification } from '../../contexts/NotificationContext';
import { authService } from '../../services/authService';
import './GlassmorphismHeader.css';

const Navigation = () => {
  const { user, logout, updateUser } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    currency: currency || user?.currency || process.env.REACT_APP_DEFAULT_CURRENCY || 'USD'
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleProfileChange = (e) => {
    setProfileData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await authService.updateProfile(profileData);
      
      // Update currency context
      setCurrency(profileData.currency);
      
      // Update auth context
      updateUser(profileData);
      
      showSuccess('Profile updated successfully');
      setShowProfileModal(false);
    } catch (error) {
      showError('Failed to update profile');
    }
  };

  const openProfileModal = () => {
    setProfileData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      currency: currency || user?.currency || process.env.REACT_APP_DEFAULT_CURRENCY || 'USD'
    });
    setShowProfileModal(true);
  };

  return (
    <>
      <nav className="glassmorphism-header">
        <div className="header-container">
          <div className="header-content">
            <div className="logo-section">
              <Link to="/" className="logo-text" style={{textDecoration: 'none'}}>
                Budget Tracker
              </Link>
            </div>
            
            <div className="nav-section">
              <button 
                onClick={() => navigate('/home')} 
                className="nav-link"
                style={{background: 'none', border: 'none', cursor: 'pointer'}}
              >
                Home
              </button>
              <button onClick={() => navigate('/dashboard')} className="nav-link">
                Dashboard
              </button>
              <button onClick={() => navigate('/expenses')} className="nav-link">
                Expenses
              </button>
              <button onClick={() => navigate('/budgets')} className="nav-link">
                Budgets
              </button>
              
              <div className="flex items-center space-x-3 ml-4">
                <span className="nav-link" style={{cursor: 'default'}}>Hello, {user?.firstName}</span>
                <button
                  onClick={openProfileModal}
                  className="nav-link" style={{padding: '0.5rem', borderRadius: '50%'}}
                  title="Edit Profile"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                <button
                  onClick={handleLogout}
                  className="nav-button"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Profile</h3>
              <form onSubmit={handleProfileSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleProfileChange}
                    className="input-field"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleProfileChange}
                    className="input-field"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className="input-field"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    name="currency"
                    value={profileData.currency}
                    onChange={handleProfileChange}
                    className="input-field"
                  >
                    <option value="INR">Indian Rupee (₹)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="GBP">British Pound (£)</option>
                    <option value="JPY">Japanese Yen (¥)</option>
                    <option value="CAD">Canadian Dollar (C$)</option>
                    <option value="AUD">Australian Dollar (A$)</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Update Profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;