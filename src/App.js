import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AdminRegister from './components/AdminRegister';
import AdminDashboard from './components/dashboard/AdminDashboard';
import NewUserDashboard from './components/dashboard/NewUserDashboard';
import ExpenseList from './components/expenses/ExpenseList';
import BudgetList from './components/budgets/BudgetList';
import UserProfile from './components/profile/UserProfile';
import LandingPage from './components/LandingPage';
import Home from './components/Home';

const AppContent = () => {
  return (
    <>
      <div className="min-h-screen bg-blue-50 font-sans">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin-register" element={<AdminRegister />} />
          
          <Route path="/home" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <NewUserDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/expenses" element={
            <ProtectedRoute>
              <ExpenseList />
            </ProtectedRoute>
          } />
          
          <Route path="/budgets" element={
            <ProtectedRoute>
              <BudgetList />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </>
  );
};

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <CurrencyProvider>
          <NavigationProvider>
            <AppContent />
          </NavigationProvider>
        </CurrencyProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;