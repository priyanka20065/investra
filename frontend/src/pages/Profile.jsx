import { useState, useEffect } from 'react';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useMarket } from '../context/MarketContext';
import api from '../services/api';
import './Profile.css';

const Profile = () => {
    const { user, sessionId, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const { showToast } = useToast();
    const { fetchData, setShowFundingModal, currentMode } = useMarket();
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
    const [sessions, setSessions] = useState([]);
    const [sessionsLoading, setSessionsLoading] = useState(true);

    const fetchSessions = async () => {
        try {
            const res = await api.get('/auth/sessions');
            if (res.success) {
                setSessions(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch sessions:', err);
        } finally {
            setSessionsLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            return showToast("New passwords do not match", "error");
        }
        try {
            const res = await api.put('/auth/updatepassword', passwords);
            if (res.success) {
                showToast("Password updated successfully", "success");
                setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }
        } catch (err) {
            showToast(err.message || "Failed to update password", "error");
        }
    };

    const handleLogoutSession = async (targetSessionId) => {
        try {
            const res = await api.delete(`/auth/sessions/${targetSessionId}`);
            if (res.success) {
                showToast("Device logged out successfully", "success");
                fetchSessions();
            }
        } catch (err) {
            showToast(err.message || "Failed to logout device", "error");
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm("WARNING: This will permanently delete your account and all trading history. Are you sure?")) {
            try {
                const res = await api.delete('/auth/deleteaccount');
                if (res.success) {
                    showToast("Account deleted successfully", "success");
                    logout();
                }
            } catch (err) {
                showToast(err.message || "Failed to delete account", "error");
            }
        }
    };

    const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleString('en-US', {
        month: 'long', year: 'numeric'
    }) : 'Recently';

    return (
        <div className="profile-page">
            {/* Header Profile Card */}
            <div className="profile-header-card">
                <div className="ph-left">
                    <div className="ph-avatar-wrapper">
                        <img src="/profile-avatar.png" alt="Profile" className="ph-avatar" />
                        <button className="ph-cam-btn">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                        </button>
                    </div>
                    <div className="ph-info">
                        <div className="ph-name-row">
                            <h1>{user?.name}</h1>
                        </div>
                        <p className="ph-email">{user?.email}</p>
                        <div className="ph-meta">
                            <span>📅 Member Since: {memberSince}</span>
                            <span>🛡️ Identity Verified</span>
                        </div>
                    </div>
                </div>
                <button className="btn-outline">View Public Profile</button>
            </div>

            <div className="profile-grid">
                {/* Left Column */}
                <div className="profile-col-left">
                    {/* Account Settings */}
                    <Card title="Account Settings" icon="👤">
                        <div className="settings-form">
                            <div className="form-row">
                                <div className="form-group half">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        value={user?.name || ''}
                                        readOnly
                                        className="readonly-input"
                                        title="Contact support to change your name"
                                    />
                                </div>
                                <div className="form-group half">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        readOnly
                                        className="readonly-input"
                                        title="Contact support to change your email"
                                    />
                                </div>
                            </div>

                            <div className="pref-section">
                                <h3>Account Preferences</h3>
                                <div className="pref-item">
                                    <div className="pref-info">
                                        <span className="pref-title">{'Switch Theme'}</span>

                                    </div>
                                    <div
                                        className={`toggle-switch ${currentMode === 'DEMO' ? 'active' : ''}`}
                                        onClick={toggleTheme}
                                        title={currentMode === 'DEMO' ? 'Switch to Original Money' : 'Switch to Demo Mode'}
                                    ></div>
                                </div>
                                {currentMode === 'REAL' && (
                                    <div className="pref-item">
                                        <div className="pref-info">
                                            <span className="pref-title">Add Capital</span>
                                            <span className="pref-desc">Securely add funds to your live trading account</span>
                                        </div>
                                        <button className="btn-primary" type="button" onClick={() => setShowFundingModal(true)}>Add Funds</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Security Update (Password) */}
                    <Card title="Security Update" icon="🔄">
                        <form className="settings-form" onSubmit={handleUpdatePassword}>
                            <div className="form-group">
                                <label>Current Password</label>
                                <div className="input-icon-wrapper">
                                    <input
                                        type={showPassword.current ? 'text' : 'password'}
                                        placeholder="Enter current password"
                                        value={passwords.currentPassword}
                                        onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                        required
                                    />
                                    <span className="eye-icon" onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}>
                                        {showPassword.current ? '🙈' : '👁️'}
                                    </span>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>New Password</label>
                                <div className="input-icon-wrapper">
                                    <input
                                        type={showPassword.new ? 'text' : 'password'}
                                        placeholder="Create a new password"
                                        value={passwords.newPassword}
                                        onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                        required
                                    />
                                    <span className="eye-icon" onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}>
                                        {showPassword.new ? '🙈' : '👁️'}
                                    </span>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Confirm Password</label>
                                <div className="input-icon-wrapper">
                                    <input
                                        type={showPassword.confirm ? 'text' : 'password'}
                                        placeholder="Confirm new password"
                                        value={passwords.confirmPassword}
                                        onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                        required
                                    />
                                    <span className="eye-icon" onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}>
                                        {showPassword.confirm ? '🙈' : '👁️'}
                                    </span>
                                </div>
                            </div>
                            <div className="form-actions right">
                                <button className="btn-outline-primary" type="submit">Update Password</button>
                            </div>
                        </form>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="profile-col-right">
                    {/* Connected Devices (Device Management) */}
                    <Card title="Connected Devices" icon="📱">
                        <div className="device-manager">
                            <p className="dm-subtitle">Manage active browser sessions.</p>

                            {sessionsLoading ? (
                                <div className="dm-loading">Loading...</div>
                            ) : (
                                <div className="session-list">
                                    {sessions.sort((a, b) => (b.sessionId === sessionId) - (a.sessionId === sessionId)).map((sess) => (
                                        <div key={sess.sessionId} className={`session-item ${sess.sessionId === sessionId ? 'current' : ''}`}>
                                            <div className="session-icon mini">
                                                {sess.sessionId === sessionId ? '💻' : '🌐'}
                                            </div>
                                            <div className="session-details">
                                                <div className="session-name mini">
                                                    {sess.sessionId === sessionId ? 'This Browser' : 'Remote Session'}
                                                </div>
                                                <div className="session-meta mini">
                                                    <span>{sess.ip || '---'}</span>
                                                </div>
                                            </div>
                                            {sess.sessionId !== sessionId && (
                                                <button
                                                    className="btn-revoke mini"
                                                    onClick={() => handleLogoutSession(sess.sessionId)}
                                                >
                                                    Revoke
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Help Card */}
                    <Card className="help-card">
                        <div className="help-content">
                            <div className="help-icon">❓</div>
                            <h3>Need help?</h3>
                            <p>Our support team is available 24/7 for security concerns.</p>
                            <a href="mailto:investra@gmail.com" className="help-link">Contact Support →</a>
                        </div>
                    </Card>

                    <button className="btn-logout-all" onClick={logout}>
                        <span>🚪 Logout from this Account</span>
                    </button>

                    <button className="btn-delete-account" onClick={handleDeleteAccount}>
                        <span>✖ Permanently Delete Account</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;

