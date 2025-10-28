import { useState, useEffect, useRef } from 'react';
import Navigation from './shared/Navigation';
import './shared/ExpenseTrackerAnimation.css';
import { expenseService } from '../services/expenseService';
import { budgetService } from '../services/budgetService';
import { formatCurrency } from '../utils/currencyHelpers';
import { useAuth } from '../contexts/AuthContext';
import { useNavigationAnimation } from '../hooks/useNavigationAnimation';
import MagneticElement from './shared/MagneticElement';
import DynamicFooter from './shared/DynamicFooter';
import heroBg from '../assets/images/top-view-woman-working-as-economist.jpg';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const { user } = useAuth();
  const { navigateWithAnimation } = useNavigationAnimation();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalExpenses: 0,
    totalBudget: 0,
    recentExpenses: [],
    expensesByCategory: []
  });
  const containerRef = useRef();
  const heroRef = useRef();

  useEffect(() => {
    loadHomeData();
    
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smooth: true,
      smoothTouch: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // GSAP animations
    const ctx = gsap.context(() => {
      gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        }
      })
      .to(".hero-title", { scale: 0.9, opacity: 0.7, y: -50 })
      .to(".hero-bg", { scale: 1.1 }, 0);
    }, containerRef);

    return () => {
      ctx.revert();
      lenis.destroy();
    };
  }, []);

  const loadHomeData = async () => {
    try {
      const [expenses, budgets] = await Promise.all([
        expenseService.getExpenses(),
        budgetService.getBudgets()
      ]);

      const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      const totalBudget = budgets.reduce((sum, budget) => sum + budget.allocatedAmount, 0);
      const recentExpenses = expenses.slice(0, 5);

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
        recentExpenses,
        expensesByCategory
      });
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
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
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-b from-white/95 via-gray-50/90 to-white text-gray-900 overflow-x-hidden relative">
      {/* Global floating shapes for entire home section */}
      <div className="absolute top-20 left-10 w-16 h-16 bg-cyan-400/30 rounded-full animate-bounce" style={{animationDelay: '0s', animationDuration: '4.5s'}}></div>
      <div className="absolute top-60 right-16 w-12 h-12 bg-yellow-400/30 rounded-full animate-bounce" style={{animationDelay: '2s', animationDuration: '3.2s'}}></div>
      <div className="absolute top-1/3 left-1/3 w-8 h-8 bg-red-400/30 rounded-full animate-bounce" style={{animationDelay: '1.2s', animationDuration: '5s'}}></div>
      <div className="absolute top-2/3 right-1/3 w-20 h-20 bg-teal-400/30 rounded-full animate-bounce" style={{animationDelay: '3s', animationDuration: '3.8s'}}></div>
      <div className="absolute bottom-32 left-12 w-14 h-14 bg-lime-400/30 rounded-full animate-bounce" style={{animationDelay: '0.5s', animationDuration: '4.2s'}}></div>
      <div className="absolute bottom-60 right-8 w-10 h-10 bg-rose-400/30 rounded-full animate-bounce" style={{animationDelay: '2.8s', animationDuration: '3.5s'}}></div>
      <div className="absolute top-1/4 right-12 w-6 h-6 bg-violet-400/30 rounded-full animate-bounce" style={{animationDelay: '1.8s', animationDuration: '4.8s'}}></div>
      <div className="absolute bottom-1/4 left-20 w-18 h-18 bg-emerald-400/30 rounded-full animate-bounce" style={{animationDelay: '0.8s', animationDuration: '3.6s'}}></div>
      
      <Navigation />
      
      {/* Hero Section */}
      <section ref={heroRef} className="hero-section min-h-screen relative overflow-hidden flex items-center">
        <div className="hero-bg absolute inset-0" style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-purple-50/80 to-indigo-50/80"></div>
          
          {/* Floating shapes */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-purple-300/60 rounded-full animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-blue-300/60 rounded-full animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
          <div className="absolute bottom-40 left-20 w-24 h-24 bg-pink-300/60 rounded-full animate-bounce" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
          <div className="absolute bottom-20 right-10 w-18 h-18 bg-indigo-300/60 rounded-full animate-bounce" style={{animationDelay: '0.5s', animationDuration: '3.5s'}}></div>
        </div>
        
        <div className="hero-content absolute inset-0 z-20 flex items-center justify-center px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="hero-title text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent leading-normal py-4">
              Financial Mastery
            </h1>
            <p className="text-2xl md:text-3xl font-semibold mb-4 text-gray-800">
              Hello, {user?.firstName}! 👋
            </p>
            <p className="text-xl md:text-2xl opacity-80 mb-8 text-gray-700">
              Your journey to financial freedom starts here
            </p>
            <div className="flex justify-center">
              <MagneticElement>
                <button onClick={() => navigateWithAnimation('/dashboard')} className="bg-gradient-to-r from-green-600 to-blue-600 px-8 py-4 rounded-full text-lg font-bold hover:shadow-2xl transition-all text-white">
                  Go to Dashboard
                </button>
              </MagneticElement>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 relative overflow-hidden">
        {/* Floating shapes for dashboard */}
        <div className="absolute top-10 left-16 w-12 h-12 bg-blue-400/40 rounded-full animate-bounce" style={{animationDelay: '0s', animationDuration: '4s'}}></div>
        <div className="absolute top-32 right-12 w-8 h-8 bg-purple-400/40 rounded-full animate-bounce" style={{animationDelay: '1.5s', animationDuration: '3s'}}></div>
        <div className="absolute bottom-20 left-8 w-16 h-16 bg-pink-400/40 rounded-full animate-bounce" style={{animationDelay: '0.8s', animationDuration: '5s'}}></div>
        <div className="absolute bottom-40 right-20 w-10 h-10 bg-indigo-400/40 rounded-full animate-bounce" style={{animationDelay: '2s', animationDuration: '3.5s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-6 h-6 bg-green-400/40 rounded-full animate-bounce" style={{animationDelay: '1s', animationDuration: '4.2s'}}></div>
        <div className="absolute top-1/3 right-1/4 w-14 h-14 bg-orange-400/40 rounded-full animate-bounce" style={{animationDelay: '2.5s', animationDuration: '3.8s'}}></div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 relative z-10">
          <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <h3 className="text-sm font-medium opacity-90">Total Expenses</h3>
            <p className="text-2xl font-bold">{formatCurrency(dashboardData.totalExpenses)}</p>
          </div>
          <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
            <h3 className="text-sm font-medium opacity-90">Total Budget</h3>
            <p className="text-2xl font-bold">{formatCurrency(dashboardData.totalBudget)}</p>
          </div>
          <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <h3 className="text-sm font-medium opacity-90">Remaining</h3>
            <p className="text-2xl font-bold">
              {formatCurrency(dashboardData.totalBudget - dashboardData.totalExpenses)}
            </p>
          </div>
          <div className="card bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <h3 className="text-sm font-medium opacity-90">Categories</h3>
            <p className="text-2xl font-bold">{dashboardData.expensesByCategory.length}</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">Recent Expenses</h3>
            {dashboardData.recentExpenses.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.recentExpenses.map((expense, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{expense.description}</p>
                      <p className="text-sm text-gray-500">{expense.category?.name || 'Uncategorized'}</p>
                    </div>
                    <span className="font-semibold text-red-600">
                      -{formatCurrency(expense.amount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No recent expenses</p>
            )}
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold mb-4">Category Breakdown</h3>
            {dashboardData.expensesByCategory.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.expensesByCategory.slice(0, 5).map((category, index) => {
                  const percentage = ((category.value / dashboardData.totalExpenses) * 100).toFixed(1);
                  return (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-3" style={{backgroundColor: `hsl(${index * 60}, 70%, 50%)`}}></div>
                        <span className="text-gray-700">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(category.value)}</p>
                        <p className="text-sm text-gray-500">{percentage}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500">No expense categories</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 card">
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => window.location.href = '/expenses'}
              className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors"
            >
              <div className="text-blue-600 mb-2">
                <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9M19 9H14V4H19V9Z"/>
                </svg>
              </div>
              <p className="text-sm font-medium text-blue-800">Add Expense</p>
            </button>
            <button 
              onClick={() => window.location.href = '/budgets'}
              className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors"
            >
              <div className="text-green-600 mb-2">
                <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                </svg>
              </div>
              <p className="text-sm font-medium text-green-800">Manage Budget</p>
            </button>
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors"
            >
              <div className="text-purple-600 mb-2">
                <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z"/>
                </svg>
              </div>
              <p className="text-sm font-medium text-purple-800">View Analytics</p>
            </button>
            <button 
              onClick={() => window.location.href = '/profile'}
              className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-center transition-colors"
            >
              <div className="text-orange-600 mb-2">
                <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
                </svg>
              </div>
              <p className="text-sm font-medium text-orange-800">Settings</p>
            </button>
          </div>
        </div>
      </div>
      
      <DynamicFooter footerType="utility" />
    </div>
  );
};

export default Home;