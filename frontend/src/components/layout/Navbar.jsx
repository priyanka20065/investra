import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMarket } from '../../context/MarketContext';
import './Navbar.css';

const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
    const { user, logout } = useAuth();
    const { balance } = useMarket();

    return (
        <header className="layout-navbar">
            <div className="navbar-left">
                <button className="toggle-btn" onClick={toggleSidebar}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
                <div className="balance-display">
                    <span className="label">Balance:</span>
                    <span className="amount">₹{balance?.toLocaleString() || '0.00'}</span>
                </div>
            </div>

            <div className="navbar-right">
                <div className="search-bar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input type="text" placeholder="Search markets..." />
                </div>

                <div className="user-section">
                    <Link to="/profile" className="user-profile-link">
                        <div className="user-info">
                            <span className="user-name">{user?.name}</span>
                        </div>
                        <img src="/profile-avatar.png" alt="User" className="avatar" />
                    </Link>
                    <button onClick={logout} className="logout-icon" title="Logout">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
