import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './GlassmorphismHeader.css';

const Header = () => {
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="glassmorphism-header">
      <div className="header-container">
        <div className="header-content">
          <div className="logo-section">
            <Link to="/" className="logo-text" style={{textDecoration: 'none'}}>
              Budget Tracker
            </Link>
          </div>
          <div className="nav-section">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/expenses" className="nav-link">Expenses</Link>
                <Link to="/budgets" className="nav-link">Budgets</Link>
                <button onClick={handleLogout} className="nav-button">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Sign In</Link>
                <Link to="/register" className="nav-button">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;