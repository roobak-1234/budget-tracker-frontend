import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { authService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import { getEnabledCurrencies } from '../../utils/currencyConfig';
import Navigation from '../shared/Navigation';

const UserProfile = () => {
  const { user, updateUser, logout } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);
  const [showFarewell, setShowFarewell] = useState(false);
  const [enabledCurrencies, setEnabledCurrencies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setEnabledCurrencies(getEnabledCurrencies());
  }, []);

  const handleCurrencyChange = async (newCurrency) => {
    setLoading(true);
    setMessage('');
    
    try {
      // Update on backend
      await authService.updateProfile({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        currency: newCurrency
      });

      // Update local state
      setCurrency(newCurrency);
      updateUser({ currency: newCurrency });
      
      setMessage('Currency updated successfully!');
    } catch (error) {
      console.error('Error updating currency:', error);
      setMessage('Failed to update currency. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await authService.deleteAccount();
      setShowFinalConfirm(false);
      setShowFarewell(true);
      
      setTimeout(() => {
        logout();
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('Error deleting account:', error);
      setMessage('Failed to delete account. Please try again.');
      setShowFinalConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">User Profile</h1>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <p className="mt-1 text-sm text-gray-900">{user?.firstName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <p className="mt-1 text-sm text-gray-900">{user?.lastName}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Currency Preference</h3>
              <div className="space-y-2">
                {enabledCurrencies.map((curr) => (
                  <label key={curr.code} className="flex items-center">
                    <input
                      type="radio"
                      name="currency"
                      value={curr.code}
                      checked={currency === curr.code}
                      onChange={() => handleCurrencyChange(curr.code)}
                      disabled={loading}
                      className="mr-3 text-blue-600"
                    />
                    <span className="text-sm text-gray-900">
                      {curr.symbol} {curr.name} ({curr.code})
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {message && (
              <div className={`p-3 rounded ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {message}
              </div>
            )}

            {loading && (
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-sm text-gray-600">Updating currency...</p>
              </div>
            )}

            {/* Delete Account Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-red-600 mb-4">Danger Zone</h3>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* First Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-bold text-red-600 mb-4">Delete Account?</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setShowFinalConfirm(true);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Final Confirmation Modal */}
      {showFinalConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-bold text-red-600 mb-4">Final Confirmation</h3>
            <p className="text-gray-700 mb-6">
              This is your last chance! Once you click "Delete Account" below, your account and all data will be permanently deleted. Are you absolutely sure?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowFinalConfirm(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Farewell Message Modal */}
      {showFarewell && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
            <div className="text-6xl mb-4">😢</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">We'll Miss You!</h3>
            <p className="text-gray-600 mb-4">
              Your account has been successfully deleted. We're sad to see you go, but we'll be here waiting for you if you ever decide to come back.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting you to the homepage in a few seconds...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;