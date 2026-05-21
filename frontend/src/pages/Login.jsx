import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import './Auth.css';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        const email = e.target[0].value;
        const password = e.target[1].value;

        try {
            const data = await api.post('/auth/login', { email, password });
            if (data.success) {
                showToast('Welcome back!', 'success');
                login(data.user, data.token, data.sessionId);
                navigate('/');
            }
        } catch (err) {
            console.error(err);
            showToast(err || 'Login failed', 'error');
        }
    };



    return (
        <div className="auth-container">
            {/* Left Panel */}
            <div className="auth-panel-left">
                <div className="brand-content">
                    <h1 className="brand-heading">Trade Smart.<br />Trade Simulated.</h1>
                    <p className="brand-desc">Master the markets without risking a penny. Join a community of over 50,000 active traders sharpening their skills daily.</p>
                    <div className="feature-list">
                        <div className="feature-item">
                            <span>⚡</span> Real-time Data
                        </div>
                        <div className="feature-item">
                            <span>📊</span> Advanced Analytics
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            <div className="auth-panel-right">
                <div className="auth-navbar">
                    <span>Don't have an account?</span>
                    <Link to="/signup" className="auth-nav-link">Sign Up</Link>
                </div>

                <div className="auth-card">
                    <h2 className="auth-title">Welcome Back</h2>
                    <p className="auth-subtitle">Login to your trading account</p>

                    <form className="auth-form" onSubmit={handleLogin}>
                        <div className="auth-field">
                            <label>Email Address</label>
                            <div className="input-wrapper">
                                <input type="email" placeholder="name@company.com" className="auth-input" />
                                <span className="input-icon">✉️</span>
                            </div>
                        </div>

                        <div className="auth-field">
                            <label>Password</label>
                            <div className="input-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="auth-input"
                                />
                                <button
                                    type="button"
                                    className="input-icon"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? "👁️" : "🔒"}
                                </button>
                            </div>
                        </div>

                        <div className="auth-options">
                            <label className="remember-me">
                                <input type="checkbox" /> Remember me
                            </label>
                            <a href="#" className="forgot-link">Forgot password?</a>
                        </div>

                        <button className="auth-btn-primary">Login →</button>
                    </form>


                </div>

                <div className="auth-footer">
                    <a href="#">Privacy Policy</a> • <a href="#">Terms of Service</a> • <a href="#">Help Center</a>
                </div>
            </div>
        </div>
    );
};

export default Login;
