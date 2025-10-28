import { useState, useEffect, useMemo } from 'react';
import Navigation from '../shared/Navigation';
import '../shared/ExpenseTrackerAnimation.css';
import { expenseService } from '../../services/expenseService';
import { budgetService } from '../../services/budgetService';
import { formatCurrency } from '../../utils/currencyHelpers';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const NewUserDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalExpenses: 0,
    totalBudget: 0,
    expensesByCategory: [],
    budgetVsActual: []
  });

  const COLORS = useMemo(() => ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B'], []);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [expenses, budgets] = await Promise.all([
        expenseService.getExpenses(),
        budgetService.getBudgets()
      ]);

      const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      const totalBudget = budgets.reduce((sum, budget) => sum + budget.allocatedAmount, 0);

      const expensesByCategory = expenses.reduce((acc, expense) => {
        const category = expense.category?.name || 'Uncategorized';
        const existing = acc.find(item => item.name === category);
        if (existing) {
          existing.value += expense.amount;
        } else {
          acc.push({ name: category, value: expense.amount });
        }
        return acc;
      }, []);

      setDashboardData({
        totalExpenses,
        totalBudget,
        expensesByCategory,
        budgetVsActual: budgets.map(budget => ({
          name: budget.name,
          budget: budget.allocatedAmount,
          actual: expenses
            .filter(expense => expense.categoryId === budget.categoryId)
            .reduce((sum, expense) => sum + expense.amount, 0)
        }))
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div>
        <Navigation />
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
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-700">Total Expenses</h3>
            <p className="text-3xl font-bold text-red-600">{formatCurrency(dashboardData.totalExpenses)}</p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-700">Total Budget</h3>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(dashboardData.totalBudget)}</p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-700">Remaining</h3>
            <p className={`text-3xl font-bold ${dashboardData.totalBudget - dashboardData.totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(dashboardData.totalBudget - dashboardData.totalExpenses)}
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <ExpenseChart 
            data={dashboardData.expensesByCategory} 
            totalExpenses={dashboardData.totalExpenses}
            colors={COLORS}
          />
          <div className="card">
            <h3 className="text-xl font-semibold mb-6">Expense Distribution</h3>
            <div className="flex justify-center">
              <ResponsiveContainer width="80%" height={600}>
              <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }} onMouseEnter={() => {}} style={{cursor: 'pointer'}}>
                <Pie
                  data={dashboardData.expensesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={false}
                  outerRadius={140}
                  innerRadius={0}
                  fill="#8884d8"
                  dataKey="value"
                  onMouseEnter={(data, index) => {}}
                  style={{cursor: 'pointer'}}
                >
                  {dashboardData.expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry) => `${value}: ${((entry.payload.value / dashboardData.totalExpenses) * 100).toFixed(1)}%`}
                />
              </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {dashboardData.budgetVsActual.length > 0 && (
          <div className="card mt-6">
            <h3 className="text-xl font-semibold mb-6">Budget vs Actual</h3>
            <div className="flex justify-center">
              <ResponsiveContainer width="90%" height={Math.max(500, dashboardData.budgetVsActual.length * 80)}>
              <BarChart data={dashboardData.budgetVsActual} margin={{ top: 40, right: 40, left: 40, bottom: 100 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="budget" fill="#8884d8" name="Budget" />
                <Bar dataKey="actual" fill="#82ca9d" name="Actual" />
              </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
      

    </div>
  );
};

// Wave-like expense chart component
const ExpenseChart = ({ data, totalExpenses, colors }) => {
  if (!data.length || totalExpenses === 0) {
    return (
      <div className="card">
        <h3 className="text-xl font-semibold mb-6">Expenses by Category</h3>
        <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
          <p className="text-gray-500">No expense data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-xl font-semibold mb-6">Expenses by Category</h3>
      <div className="flex justify-center">
        <div className="relative bg-gray-100 rounded-lg p-2" style={{height: '350px', width: '90%'}}>
        <svg width="100%" height="100%" viewBox="0 0 1000 350" preserveAspectRatio="xMidYMid meet" className="w-full h-full">
          {/* Chart axes */}
          <line x1="80" y1="320" x2="800" y2="320" stroke="#374151" strokeWidth="2" />
          <line x1="80" y1="60" x2="80" y2="320" stroke="#374151" strokeWidth="2" />
          
          {/* X-axis labels */}
          {[0, 120, 240, 360, 480, 600, 720].map((x, i) => (
            <g key={`x-${i}`}>
              <line x1={80 + x} y1="320" x2={80 + x} y2="325" stroke="#374151" strokeWidth="1" />
              <text x={80 + x} y="340" textAnchor="middle" fontSize="12" fill="#374151">
                {i * 120}
              </text>
            </g>
          ))}
          
          {/* Y-axis labels */}
          {[0, 20, 40, 60, 80, 100].map((value, i) => {
            const y = 320 - (value * 2.4);
            return (
              <g key={`y-${i}`}>
                <line x1="75" y1={y} x2="80" y2={y} stroke="#374151" strokeWidth="1" />
                <text x="70" y={y + 4} textAnchor="end" fontSize="12" fill="#374151">
                  {value}%
                </text>
              </g>
            );
          })}
          
          {/* Axis labels */}
          <text x="440" y="365" textAnchor="middle" fontSize="14" fill="#374151" fontWeight="bold">
            Time
          </text>
          <text x="30" y="190" textAnchor="middle" fontSize="14" fill="#374151" fontWeight="bold" transform="rotate(-90 30 190)">
            Amount %
          </text>
          
          {/* Wave visualization */}
          {data.map((item, index) => {
            const percentage = (item.value / totalExpenses) * 100;
            const amplitude = (percentage / 100) * 20 + 5;
            const frequency = 0.015 + (index * 0.003);
            const yOffset = 250 - (index * Math.min(25, 200 / data.length));
            
            let path = `M 80 ${yOffset}`;
            for (let x = 80; x <= 800; x += 4) {
              const y = yOffset + Math.sin((x - 80) * frequency) * amplitude;
              path += ` L ${x} ${y}`;
            }
            
            return (
              <g key={`${item.name}-${index}`}>
                <path
                  d={path}
                  fill="none"
                  stroke={colors[index % colors.length]}
                  strokeWidth="3"
                  opacity="0.8"
                />
                <text
                  x="820"
                  y={yOffset + 5}
                  fill={colors[index % colors.length]}
                  fontSize="13"
                  fontWeight="bold"
                >
                  {item.name}: {percentage.toFixed(1)}%
                </text>
              </g>
            );
          })}
        </svg>
        </div>
      </div>
    </div>
  );
};

export default NewUserDashboard;