import { useState, useEffect, useCallback } from 'react';
import Navigation from '../shared/Navigation';
import '../shared/ExpenseTrackerAnimation.css';
import { budgetService } from '../../services/budgetService';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/currencyHelpers';
import { formatDate } from '../../utils/dateHelpers';

const BudgetList = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    allocatedAmount: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    budgetType: 'MONTHLY'
  });
  const { showSuccess, showError } = useNotification();
  const { user } = useAuth();

  const loadBudgets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await budgetService.getBudgets();
      setBudgets(Array.isArray(data) ? data : []);
    } catch (error) {
      showError('Failed to load budgets');
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const filteredBudgets = budgets.filter(budget => {
    const searchLower = searchTerm.toLowerCase();
    return budget.name.toLowerCase().includes(searchLower) ||
           budget.budgetType?.toLowerCase().includes(searchLower) ||
           budget.startDate.includes(searchTerm) ||
           budget.endDate.includes(searchTerm) ||
           budget.allocatedAmount.toString().includes(searchTerm);
  });

  const sortedBudgets = [...filteredBudgets].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'allocatedAmount') {
      aValue = parseFloat(aValue);
      bValue = parseFloat(bValue);
    } else if (sortBy === 'startDate' || sortBy === 'endDate') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const totalPages = Math.ceil(sortedBudgets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBudgets = sortedBudgets.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await budgetService.deleteBudget(id);
        showSuccess('Budget deleted successfully');
        await loadBudgets();
      } catch (error) {
        showError('Failed to delete budget');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBudget) {
        await budgetService.updateBudget(editingBudget.id, {
          ...formData,
          allocatedAmount: parseFloat(formData.allocatedAmount)
        });
        showSuccess('Budget updated successfully');
      } else {
        await budgetService.createBudget({
          ...formData,
          allocatedAmount: parseFloat(formData.allocatedAmount)
        });
        showSuccess('Budget added successfully');
      }
      setShowModal(false);
      setEditingBudget(null);
      setFormData({
        name: '',
        allocatedAmount: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        budgetType: 'MONTHLY'
      });
      await loadBudgets();
    } catch (error) {
      showError(editingBudget ? 'Failed to update budget' : 'Failed to add budget');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      name: budget.name,
      allocatedAmount: budget.allocatedAmount.toString(),
      startDate: budget.startDate,
      endDate: budget.endDate,
      budgetType: budget.budgetType || 'MONTHLY'
    });
    setShowModal(true);
  };

  return (
    <div>
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search budgets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select 
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                  setCurrentPage(1);
                }}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="allocatedAmount-desc">Amount (High to Low)</option>
                <option value="allocatedAmount-asc">Amount (Low to High)</option>
                <option value="startDate-desc">Start Date (Newest First)</option>
                <option value="startDate-asc">Start Date (Oldest First)</option>
                <option value="budgetType-asc">Type (A-Z)</option>
                <option value="budgetType-desc">Type (Z-A)</option>
              </select>
            </div>
            <button onClick={() => setShowModal(true)} className="btn-primary">
              Add Budget
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center">
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
          <div className="card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('name')}
                    >
                      Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('allocatedAmount')}
                    >
                      Amount {sortBy === 'allocatedAmount' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('startDate')}
                    >
                      Period {sortBy === 'startDate' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('budgetType')}
                    >
                      Type {sortBy === 'budgetType' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedBudgets.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        No budgets found
                      </td>
                    </tr>
                  ) : (
                    paginatedBudgets.map((budget) => (
                      <tr key={budget.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {budget.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {formatCurrency(budget.allocatedAmount, user?.currency)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(budget.startDate)} - {formatDate(budget.endDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {budget.budgetType || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button 
                            onClick={() => handleEdit(budget)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(budget.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t">
                <div className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedBudgets.length)} of {sortedBudgets.length} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 text-sm border rounded ${
                        currentPage === i + 1
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add Budget Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingBudget ? 'Edit Budget' : 'Add New Budget'}
                </h3>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="allocatedAmount"
                      value={formData.allocatedAmount}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget Type
                    </label>
                    <select
                      name="budgetType"
                      value={formData.budgetType}
                      onChange={handleChange}
                      className="input-field"
                    >
                      <option value="MONTHLY">Monthly</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="YEARLY">Yearly</option>
                      <option value="CUSTOM">Custom</option>
                    </select>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      {editingBudget ? 'Update Budget' : 'Add Budget'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetList;