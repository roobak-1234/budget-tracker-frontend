import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../shared/ExpenseTrackerAnimation.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;