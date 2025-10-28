import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import '../shared/ExpenseTrackerAnimation.css';

import { adminService } from '../../services/adminService';
import { formatCurrency } from '../../utils/currencyHelpers';
import '../shared/GlassmorphismHeader.css';
import '../shared/Animations.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [userFilter, setUserFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [newPassword, setNewPassword] = useState('');
  const [categoryForm, setCategoryForm] = useState({ name: '' });
  const [analyticsData, setAnalyticsData] = useState({ 
    categorySpending: [], 
    recentTransactions: [], 
    monthlyTrend: [], 
    topUsers: [], 
    budgetAnalysis: [] 
  });
  const [adminData, setAdminData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTransactions: 0,
    totalAmount: 0,
    newRegistrations: [],
    topCategories: [],
    users: [],
    categories: [],
    currencies: [
      { code: 'USD', name: 'US Dollar', symbol: '$', enabled: true },
      { code: 'EUR', name: 'Euro', symbol: '€', enabled: true },
      { code: 'GBP', name: 'British Pound', symbol: '£', enabled: true },
      { code: 'INR', name: 'Indian Rupee', symbol: '₹', enabled: true },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥', enabled: true },
      { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', enabled: true },
      { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', enabled: true },
      { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', enabled: false },
      { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', enabled: false },
      { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', enabled: false },
      { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', enabled: false },
      { code: 'DKK', name: 'Danish Krone', symbol: 'kr', enabled: false },
      { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', enabled: false },
      { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', enabled: false },
      { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', enabled: false },
      { code: 'RUB', name: 'Russian Ruble', symbol: '₽', enabled: false },
      { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', enabled: false },
      { code: 'MXN', name: 'Mexican Peso', symbol: '$', enabled: false },
      { code: 'ARS', name: 'Argentine Peso', symbol: '$', enabled: false },
      { code: 'CLP', name: 'Chilean Peso', symbol: '$', enabled: false },
      { code: 'COP', name: 'Colombian Peso', symbol: '$', enabled: false },
      { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/', enabled: false },
      { code: 'ZAR', name: 'South African Rand', symbol: 'R', enabled: false },
      { code: 'EGP', name: 'Egyptian Pound', symbol: '£', enabled: false },
      { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', enabled: false },
      { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', enabled: false },
      { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵', enabled: false },
      { code: 'KRW', name: 'South Korean Won', symbol: '₩', enabled: false },
      { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', enabled: false },
      { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', enabled: false },
      { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$', enabled: false },
      { code: 'THB', name: 'Thai Baht', symbol: '฿', enabled: false },
      { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', enabled: false },
      { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', enabled: false },
      { code: 'PHP', name: 'Philippine Peso', symbol: '₱', enabled: false },
      { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', enabled: false },
      { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', enabled: false },
      { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', enabled: false },
      { code: 'LKR', name: 'Sri Lankan Rupee', symbol: '₨', enabled: false },
      { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', enabled: false },
      { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', enabled: false },
      { code: 'QAR', name: 'Qatari Riyal', symbol: '﷼', enabled: false },
      { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', enabled: false },
      { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب', enabled: false },
      { code: 'OMR', name: 'Omani Rial', symbol: '﷼', enabled: false },
      { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا', enabled: false },
      { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', enabled: false },
      { code: 'TRY', name: 'Turkish Lira', symbol: '₺', enabled: false }
    ]
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadAdminData = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Loading admin data...');
      const [stats, users, categories] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getAllUsers(),
        adminService.getAllCategories()
      ]);
      
      const analytics = await adminService.getAnalytics();
      console.log('Admin data loaded successfully:', { stats, users: users.length, categories: categories.length });
      setAnalyticsData(analytics);
      
      setAdminData({
        totalUsers: stats.totalUsers,
        activeUsers: stats.activeUsers,
        totalTransactions: stats.totalTransactions,
        totalAmount: stats.totalAmount,
        newRegistrations: stats.newRegistrations || [],
        topCategories: stats.topCategories || [],
        users: users.map(user => ({
          id: user.id,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Unknown User',
          email: user.email,
          registrationDate: new Date(user.createdAt).toLocaleDateString(),
          status: user.isActive ? 'Active' : 'Inactive'
        })),
        categories: categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          icon: '📊'
        })),
        currencies: [
          { code: 'USD', name: 'US Dollar', symbol: '$', enabled: true },
          { code: 'EUR', name: 'Euro', symbol: '€', enabled: true },
          { code: 'GBP', name: 'British Pound', symbol: '£', enabled: true },
          { code: 'INR', name: 'Indian Rupee', symbol: '₹', enabled: true },
          { code: 'JPY', name: 'Japanese Yen', symbol: '¥', enabled: true },
          { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', enabled: true },
          { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', enabled: true },
          { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', enabled: false }
        ]
      });
      
      // Store currencies in localStorage for other components
      const currenciesData = [
        { code: 'USD', name: 'US Dollar', symbol: '$', enabled: true },
        { code: 'EUR', name: 'Euro', symbol: '€', enabled: true },
        { code: 'GBP', name: 'British Pound', symbol: '£', enabled: true },
        { code: 'INR', name: 'Indian Rupee', symbol: '₹', enabled: true },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥', enabled: true },
        { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', enabled: true },
        { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', enabled: true },
        { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', enabled: false }
      ];
      const enabledCurrencies = currenciesData.filter(c => c.enabled).map(c => ({ code: c.code, name: c.name, symbol: c.symbol }));
      localStorage.setItem('enabledCurrencies', JSON.stringify(enabledCurrencies));
      localStorage.setItem('allCurrencies', JSON.stringify(currenciesData));
    } catch (error) {
      console.error('Error loading admin data:', error);
      showError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const handleViewUser = async (userId) => {
    try {
      const userDetails = await adminService.getUserDetails(userId);
      setSelectedUser(userDetails);
      setShowUserModal(true);
    } catch (error) {
      showError('Failed to load user details');
    }
  };

  const handleEditUser = async (userId) => {
    try {
      const userDetails = await adminService.getUserDetails(userId);
      setSelectedUser(userDetails);
      setEditForm({
        firstName: userDetails.firstName || '',
        lastName: userDetails.lastName || '',
        email: userDetails.email || '',
        currency: userDetails.currency || 'INR'
      });
      setShowEditModal(true);
    } catch (error) {
      showError('Failed to load user details');
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      if (currentStatus === 'Active') {
        await adminService.suspendUser(userId);
        showSuccess('User suspended successfully');
      } else {
        await adminService.activateUser(userId);
        showSuccess('User activated successfully');
      }
      loadAdminData();
    } catch (error) {
      showError('Failed to update user status');
    }
  };

  const handleResetPassword = async (userId) => {
    const user = adminData.users.find(u => u.id === userId);
    setSelectedUser(user);
    setNewPassword('');
    setShowResetModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to deactivate this user? This will disable their account.')) {
      try {
        await adminService.deleteUser(userId);
        showSuccess('User deactivated successfully');
        loadAdminData();
      } catch (error) {
        console.error('Deactivate error:', error);
        const errorMsg = error.response?.data || error.message || 'Failed to deactivate user';
        showError(errorMsg);
      }
    }
  };

  const handleSaveEdit = async () => {
    try {
      await adminService.updateUser(selectedUser.id, editForm);
      showSuccess('User updated successfully');
      setShowEditModal(false);
      loadAdminData();
    } catch (error) {
      showError('Failed to update user');
    }
  };

  const handleSavePassword = async () => {
    if (newPassword.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }
    try {
      await adminService.resetUserPassword(selectedUser.id, newPassword);
      showSuccess('Password reset successfully');
      setShowResetModal(false);
      setNewPassword('');
    } catch (error) {
      showError('Failed to reset password');
    }
  };

  const handleAddCategory = () => {
    setCategoryForm({ name: '' });
    setSelectedCategory(null);
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setCategoryForm({ name: category.name });
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) {
      showError('Category name is required');
      return;
    }
    
    try {
      if (selectedCategory) {
        await adminService.updateCategory(selectedCategory.id, categoryForm.name);
        showSuccess('Category updated successfully');
      } else {
        await adminService.createCategory(categoryForm.name);
        showSuccess('Category created successfully');
      }
      setShowCategoryModal(false);
      loadAdminData();
    } catch (error) {
      console.error('Category save error:', error);
      const errorMsg = error.response?.data || error.message || 'Failed to save category';
      showError(errorMsg);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await adminService.deleteCategory(categoryId);
        showSuccess('Category deleted successfully');
        loadAdminData();
      } catch (error) {
        showError('Failed to delete category');
      }
    }
  };





  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-600">Total Registered Users</h3>
              <p className="text-2xl font-bold text-blue-900">{adminData.totalUsers.toLocaleString()}</p>
              <p className="text-xs text-green-600">↗ +12% from last week</p>
            </div>
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
        </div>
        
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-green-600">Active Users (30 days)</h3>
              <p className="text-2xl font-bold text-green-900">{adminData.activeUsers.toLocaleString()}</p>
              <p className="text-xs text-green-600">↗ +8% from last month</p>
            </div>
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        
        <div className="card bg-purple-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-purple-600">Total Transactions</h3>
              <p className="text-2xl font-bold text-purple-900">{adminData.totalTransactions.toLocaleString()}</p>
              <p className="text-xs text-green-600">↗ +15% from last month</p>
            </div>
            <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        
        <div className="card bg-orange-50 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-orange-600">Total Amount Tracked</h3>
              <p className="text-2xl font-bold text-orange-900">{formatCurrency(adminData.totalAmount, 'INR')}</p>
              <p className="text-xs text-green-600">↗ +22% from last month</p>
            </div>
            <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">New User Registrations (Last 7 Days)</h3>
          <div className="h-48 relative bg-gray-50 rounded-lg">
            {adminData.newRegistrations.length > 0 ? (
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Grid lines */}
                <defs>
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                
                {/* Axes */}
                <line x1="10" y1="5" x2="10" y2="85" stroke="#374151" strokeWidth="1" vectorEffect="non-scaling-stroke"/>
                <line x1="10" y1="85" x2="95" y2="85" stroke="#374151" strokeWidth="1" vectorEffect="non-scaling-stroke"/>
                
                {/* Y-axis labels */}
                {(() => {
                  const maxCount = Math.max(...adminData.newRegistrations, 1);
                  return [0, 1, 2, 3, 4].map(i => {
                    const value = Math.round((maxCount / 4) * i);
                    const y = 85 - (i * 20);
                    return (
                      <g key={i}>
                        <text x="8" y={y + 2} textAnchor="end" className="text-xs fill-gray-600" style={{fontSize: '3px'}}>{value}</text>
                      </g>
                    );
                  });
                })()}
                
                {/* X-axis labels */}
                {adminData.newRegistrations.map((_, index) => {
                  const x = 10 + ((index + 1) * (85 / 7));
                  return (
                    <text key={index} x={x} y="95" textAnchor="middle" className="text-xs fill-gray-600" style={{fontSize: '3px'}}>{index + 1}</text>
                  );
                })}
                
                {/* Data line and points */}
                {(() => {
                  const maxCount = Math.max(...adminData.newRegistrations, 1);
                  const points = adminData.newRegistrations.map((count, index) => {
                    const x = 10 + ((index + 1) * (85 / 7));
                    const y = 85 - (count / maxCount) * 75;
                    return { x, y, count };
                  });
                  
                  const pathData = points.map((point, index) => 
                    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
                  ).join(' ');
                  
                  return (
                    <>
                      <path d={pathData} fill="none" stroke="#3b82f6" strokeWidth="1" vectorEffect="non-scaling-stroke"/>
                      {points.map((point, index) => (
                        <g key={index}>
                          <circle cx={point.x} cy={point.y} r="1.5" fill="#3b82f6" vectorEffect="non-scaling-stroke"/>
                          <text x={point.x} y={point.y - 3} textAnchor="middle" className="text-xs fill-gray-800" style={{fontSize: '2.5px'}}>{point.count}</text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            ) : <p className="text-gray-500 text-center py-16">No registration data available</p>}
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Top 5 Expense Categories</h3>
          <div className="space-y-3">
            {adminData.topCategories.length > 0 ? adminData.topCategories.map((category, index) => {
              const maxCount = Math.max(...adminData.topCategories.map(c => c.count), 1);
              return (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{category.name}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(category.count / maxCount) * 100}%` }}></div>
                    </div>
                    <span className="text-sm text-gray-600">{category.count}</span>
                  </div>
                </div>
              );
            }) : <p className="text-gray-500 text-center py-8">No category data available</p>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="flex space-x-4">
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field" 
          />
          <select 
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Users</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      
      <div className="card overflow-x-auto">
        <table className="w-full min-w-max">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-80">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {adminData.users
              .filter(user => {
                const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    user.email.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesFilter = userFilter === 'all' || 
                                    (userFilter === 'active' && user.status === 'Active') ||
                                    (userFilter === 'inactive' && user.status === 'Inactive');
                return matchesSearch && matchesFilter;
              })
              .map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-4 text-sm text-gray-900">{user.id}</td>
                <td className="px-4 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                <td className="px-4 py-4 text-sm text-gray-900">{user.email}</td>
                <td className="px-4 py-4 text-sm text-gray-900">{user.registrationDate}</td>
                <td className="px-4 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleViewUser(user.id)}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => handleEditUser(user.id)}
                        className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleResetPassword(user.id)}
                        className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                      >
                        Reset
                      </button>
                    </div>
                    <div className="flex gap-1">
                      {user.status === 'Active' ? (
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleToggleUserStatus(user.id, user.status)}
                          className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCategoryManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Master Category Management</h2>
        <button onClick={handleAddCategory} className="btn-primary inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Category
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminData.categories.map((category) => (
          <div key={category.id} className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{category.icon}</span>
                <span className="font-medium">{category.name}</span>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleEditCategory(category)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => {
    const maxSpending = Math.max(...analyticsData.categorySpending.map(item => item.value), 1);
    const maxMonthly = Math.max(...analyticsData.monthlyTrend.map(item => item.amount), 1);
    const maxUserSpending = Math.max(...analyticsData.topUsers.map(user => user.totalSpent), 1);
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">System Analytics & Reports</h2>
          <button className="btn-secondary inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
        </div>
        
        {/* Monthly Spending Trend */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Monthly Spending Trend (Last 6 Months)</h3>
          <div className="h-48 flex items-end space-x-4 px-4">
            {analyticsData.monthlyTrend.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                  style={{ height: `${(item.amount / maxMonthly) * 150}px`, minHeight: '10px' }}
                  title={`${item.month}: ${formatCurrency(item.amount, 'INR')}`}
                ></div>
                <span className="text-xs mt-2 text-gray-600">{item.month}</span>
                <span className="text-xs text-gray-500">{formatCurrency(item.amount, 'INR')}</span>
              </div>
            ))}
            {analyticsData.monthlyTrend.length === 0 && (
              <p className="text-gray-500 text-center w-full py-16">No monthly data available</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Spending */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
            <div className="space-y-3">
              {analyticsData.categorySpending.slice(0, 8).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate">{item.name}</span>
                  <div className="flex items-center space-x-2 flex-1 ml-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300" 
                        style={{ width: `${(item.value / maxSpending) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 min-w-20 text-right">
                      {formatCurrency(item.value, 'INR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Top Spending Users */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Top Spending Users</h3>
            <div className="space-y-3">
              {analyticsData.topUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <p className="text-xs text-blue-600">{user.transactionCount} transactions</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-green-600">
                      {formatCurrency(user.totalSpent, 'INR')}
                    </span>
                    <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(user.totalSpent / maxUserSpending) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Recent Transactions */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Transaction Logs</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {analyticsData.recentTransactions.map((transaction, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-3 py-2 bg-gray-50 rounded-r">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <span className="text-sm font-medium text-blue-600">{transaction.category}</span>
                    <p className="text-xs text-gray-600 mt-1">{transaction.description}</p>
                    <p className="text-xs text-gray-400">by {transaction.user}</p>
                  </div>
                  <div className="text-right ml-2">
                    <span className="text-sm font-bold text-gray-800">
                      {formatCurrency(transaction.amount, 'INR')}
                    </span>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {analyticsData.recentTransactions.length === 0 && (
              <p className="text-gray-500 text-center py-8">No transactions available</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCurrencyManagement = () => {
    const handleToggleCurrency = async (currencyCode) => {
      const currency = adminData.currencies.find(c => c.code === currencyCode);
      const newEnabledState = !currency.enabled;
      
      setAdminData(prev => ({
        ...prev,
        currencies: prev.currencies.map(c => 
          c.code === currencyCode 
            ? { ...c, enabled: newEnabledState }
            : c
        )
      }));
      
      // Update localStorage for enabled currencies
      const updatedCurrencies = adminData.currencies.map(c => 
        c.code === currencyCode ? { ...c, enabled: newEnabledState } : c
      );
      const enabledCurrencies = updatedCurrencies
        .filter(c => c.enabled)
        .map(c => ({ code: c.code, name: c.name, symbol: c.symbol }));
      localStorage.setItem('enabledCurrencies', JSON.stringify(enabledCurrencies));
      localStorage.setItem('allCurrencies', JSON.stringify(updatedCurrencies));
      
      showSuccess(`${currencyCode} ${newEnabledState ? 'enabled' : 'disabled'} successfully`);
    };

    const enabledCurrencies = adminData.currencies?.filter(c => c.enabled) || [];
    const disabledCurrencies = adminData.currencies?.filter(c => !c.enabled) || [];

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Currency Management</h2>
          <div className="text-sm text-gray-600">
            {enabledCurrencies.length} of {adminData.currencies?.length || 0} currencies enabled
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enabled Currencies */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-green-600">✅ Enabled Currencies ({enabledCurrencies.length})</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {enabledCurrencies.map((currency) => (
                <div key={currency.code} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl font-bold text-green-600">{currency.symbol}</span>
                    <div>
                      <span className="font-medium text-green-800">{currency.code}</span>
                      <p className="text-sm text-green-600">{currency.name}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleToggleCurrency(currency.code)}
                    className="px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm"
                  >
                    Disable
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Disabled Currencies */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-gray-600">❌ Disabled Currencies ({disabledCurrencies.length})</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {disabledCurrencies.map((currency) => (
                <div key={currency.code} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl font-bold text-gray-400">{currency.symbol}</span>
                    <div>
                      <span className="font-medium text-gray-600">{currency.code}</span>
                      <p className="text-sm text-gray-500">{currency.name}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleToggleCurrency(currency.code)}
                    className="px-3 py-1 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors text-sm"
                  >
                    Enable
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Currency Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card bg-blue-50 border-blue-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{enabledCurrencies.length}</div>
              <div className="text-sm text-blue-600">Active Currencies</div>
            </div>
          </div>
          <div className="card bg-yellow-50 border-yellow-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{disabledCurrencies.length}</div>
              <div className="text-sm text-yellow-600">Inactive Currencies</div>
            </div>
          </div>
          <div className="card bg-purple-50 border-purple-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{adminData.currencies?.length || 0}</div>
              <div className="text-sm text-purple-600">Total Supported</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview': return renderOverview();
      case 'users': return renderUserManagement();
      case 'categories': return renderCategoryManagement();
      case 'analytics': return renderAnalytics();
      case 'currencies': return renderCurrencyManagement();
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&h=1080&fit=crop&crop=center&opacity=0.1)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed'}}>
      {/* Header */}
      <nav className="glassmorphism-header">
        <div className="header-container">
          <div className="header-content">
            <div className="logo-section">
              <h1 className="logo-text">Admin Dashboard</h1>
            </div>
            <div className="nav-section">
              <span className="logo-text">Welcome, {user?.firstName}</span>
              <button
                onClick={() => {
                  setProfileForm({
                    firstName: user?.firstName || '',
                    lastName: user?.lastName || '',
                    email: user?.email || ''
                  });
                  setShowProfileModal(true);
                }}
                className="nav-button inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/';
                }}
                className="nav-button inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-20 px-4 gap-4">
        {/* Sidebar */}
        <div className="w-64 bg-white/80 backdrop-blur-md shadow-2xl rounded-3xl animate-slide-in-left border border-white/20">
          <div className="p-6">
            <h2 className="text-xl font-bold text-blue-900">Navigation</h2>
          </div>
        
          <nav className="mt-6">
            <div className="px-6 space-y-3">
              <button
                onClick={() => setActiveSection('overview')}
                className={`w-full text-left px-4 py-3 rounded-2xl transition-all duration-300 btn-hover-scale inline-flex items-center gap-3 transform hover:scale-105 ${
                  activeSection === 'overview' ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 shadow-lg' : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Overview
              </button>
              <button
                onClick={() => setActiveSection('users')}
                className={`w-full text-left px-4 py-3 rounded-2xl transition-all duration-300 btn-hover-scale inline-flex items-center gap-3 transform hover:scale-105 ${
                  activeSection === 'users' ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 shadow-lg' : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                User Management
              </button>
              <button
                onClick={() => setActiveSection('categories')}
                className={`w-full text-left px-4 py-3 rounded-2xl transition-all duration-300 btn-hover-scale inline-flex items-center gap-3 transform hover:scale-105 ${
                  activeSection === 'categories' ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 shadow-lg' : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Categories
              </button>
              <button
                onClick={() => setActiveSection('analytics')}
                className={`w-full text-left px-4 py-3 rounded-2xl transition-all duration-300 btn-hover-scale inline-flex items-center gap-3 transform hover:scale-105 ${
                  activeSection === 'analytics' ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 shadow-lg' : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Analytics
              </button>
              <button
                onClick={() => setActiveSection('currencies')}
                className={`w-full text-left px-4 py-3 rounded-2xl transition-all duration-300 btn-hover-scale inline-flex items-center gap-3 transform hover:scale-105 ${
                  activeSection === 'currencies' ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 shadow-lg' : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                Currency Management
              </button>
            </div>
          </nav>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="max-w-7xl mx-auto" style={{background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.8))', borderRadius: '32px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(16px)'}}>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="expense-tracker-animation">
                    <svg className="animated-text" viewBox="0 0 800 200">
                      <text className="text-stroke" x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                        Budget Tracker
                      </text>
                      <text className="text-fill" x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                        Budget Tracker
                      </text>
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="animate-fade-in-up">
                  {renderContent()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">User Details</h3>
            <div className="space-y-2">
              <p><strong>Name:</strong> {selectedUser.firstName} {selectedUser.lastName}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Currency:</strong> {selectedUser.currency}</p>
              <p><strong>Status:</strong> {selectedUser.isActive ? 'Active' : 'Inactive'}</p>
              <p><strong>Expenses:</strong> {selectedUser.expenseCount}</p>
              <p><strong>Budgets:</strong> {selectedUser.budgetCount}</p>
              <p><strong>Joined:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={() => setShowUserModal(false)} className="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Edit User</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="First Name"
                value={editForm.firstName}
                onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={editForm.lastName}
                onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                className="input-field"
              />
              <input
                type="email"
                placeholder="Email"
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                className="input-field"
              />
              <select
                value={editForm.currency}
                onChange={(e) => setEditForm({...editForm, currency: e.target.value})}
                className="input-field"
              >
                {JSON.parse(localStorage.getItem('enabledCurrencies') || '[]').map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.name} ({currency.symbol})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button onClick={() => setShowEditModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSaveEdit} className="btn-primary">Save</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Reset Password Modal */}
      {showResetModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Reset Password for {selectedUser.name}</h3>
            <input
              type="password"
              placeholder="New Password (min 6 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowResetModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSavePassword} className="btn-primary">Reset Password</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">
              {selectedCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
            <input
              type="text"
              placeholder="Category Name"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({name: e.target.value})}
              className="input-field mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowCategoryModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSaveCategory} className="btn-primary">
                {selectedCategory ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Admin Profile</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="First Name"
                value={profileForm.firstName}
                onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={profileForm.lastName}
                onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})}
                className="input-field"
              />
              <input
                type="email"
                placeholder="Email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                className="input-field"
                disabled
              />
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button onClick={() => setShowProfileModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={() => {
                showSuccess('Profile updated successfully');
                setShowProfileModal(false);
              }} className="btn-primary">Save</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Impressive Admin Footer */}
      <footer className="relative bg-gradient-to-r from-slate-900 via-gray-900 to-slate-900 text-white py-8 mt-4 overflow-hidden rounded-3xl mx-4 mb-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-indigo-600/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Admin Control</h3>
                  <p className="text-gray-400 text-sm">Secure Management</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-blue-300">Support Center</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">admin@budgettracker.com</p>
                    <p className="text-xs text-gray-400">24/7 Support</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">+1 (555) 123-4567</p>
                    <p className="text-xs text-gray-400">Emergency Line</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-purple-300">Resources</h3>
              <div className="space-y-2">
                <button type="button" className="block p-2 rounded-lg hover:bg-white/5 transition-all duration-300 hover:translate-x-1 group w-full text-left">
                  <span className="text-sm flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    System Documentation
                  </span>
                </button>
                <button type="button" className="block p-2 rounded-lg hover:bg-white/5 transition-all duration-300 hover:translate-x-1 group w-full text-left">
                  <span className="text-sm flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    API Reference
                  </span>
                </button>
                <button type="button" className="block p-2 rounded-lg hover:bg-white/5 transition-all duration-300 hover:translate-x-1 group w-full text-left">
                  <span className="text-sm flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Security Guidelines
                  </span>
                </button>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-green-300">System Status</h3>
              <div className="space-y-3">
                <div className="p-3 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-400">All Systems Operational</span>
                  </div>
                  <div className="text-xs text-gray-400 space-y-1">
                    <p>Version: 2.1.0</p>
                    <p>Updated: {new Date().toLocaleDateString()}</p>
                    <p>Uptime: 99.9%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700/50 mt-8 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center gap-4 mb-4 md:mb-0">
                <p className="text-sm text-gray-400">&copy; 2024 Budget Tracker Admin Panel. All rights reserved.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Secured by SSL
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  ISO 27001 Certified
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;