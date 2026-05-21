import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import './Auth.css';

const Signup = () => {
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        const name = e.target[0].value;
        const email = e.target[1].value;
        const password = e.target[2].value;
        const confirmPassword = e.target[3].value;

        if (password !== confirmPassword) {
            return showToast('Passwords do not match', 'error');
        }

        try {
            const data = await api.post('/auth/signup', { name, email, password });
            if (data.success) {
                showToast('Account created successfully!', 'success');
                login(data.user, data.token, data.sessionId);
                navigate('/');
            }
        } catch (err) {
            console.error(err);
            showToast(err || 'Signup failed', 'error');
        }
    };



    const getStrength = (pass) => {
        if (pass.length === 0) return '';
        if (pass.length < 6) return 'weak';
        if (pass.length < 10) return 'medium';
        return 'strong';
    };

    const strength = getStrength(password);

    return (
        <div className="auth-container">
            {/* Left Panel */}
            <div className="auth-panel-left">
                <div className="brand-content">
                    <h1 className="brand-heading">Trade Smart.<br />Trade Simulated.</h1>
                    <p className="brand-desc">Master the markets without risking a penny. Join a community of over 50,000 active traders sharpening their skills daily.</p>
                </div>
                <div className="brand-visuals">
                    <div className="glass-card float-animation">
                        <div className="gc-header">
                            <span className="gc-icon">🚀</span>
                            <span>Portfolio Growth</span>
                        </div>
                        <div className="gc-value">+24.5%</div>
                        <div className="gc-mini-chart">
                            <svg viewBox="0 0 100 30" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M0 25 C20 25 20 10 40 15 S60 5 80 5 L100 0" stroke="rgba(255,255,255,0.8)" />
                            </svg>
                        </div>
                    </div>
                    <div className="glass-card float-animation-delayed">
                        <div className="trade-notif">
                            <div className="check-circle">✓</div>
                            <div>
                                <div className="tn-title">Order Executed</div>
                                <div className="tn-desc">RELIANCE • 10 Qty</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            <div className="auth-panel-right">
                <div className="auth-navbar">
                    <span>Already have an account?</span>
                    <Link to="/login" className="auth-nav-link">Login</Link>
                </div>

                <div className="auth-card">
                    <h2 className="auth-title">Create Account</h2>
                    <p className="auth-subtitle">Join thousands of simulated traders</p>

                    <form className="auth-form" onSubmit={handleSignup}>
                        <div className="auth-field">
                            <label>Full Name</label>
                            <input type="text" placeholder="e.g. John Doe" className="auth-input" />
                        </div>

                        <div className="auth-field">
                            <label>Email Address</label>
                            <input type="email" placeholder="name@company.com" className="auth-input" />
                        </div>

                        <div className="auth-field">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="auth-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {password && (
                                <div className={`password-strength ${strength}`}>
                                    <div className="strength-bar bar-1"></div>
                                    <div className="strength-bar bar-2"></div>
                                    <div className="strength-bar bar-3"></div>
                                </div>
                            )}
                            {password && <div className="strength-label">STRENGTH: {strength.toUpperCase()}</div>}
                        </div>

                        <div className="auth-field">
                            <label>Confirm Password</label>
                            <input type="password" placeholder="••••••••" className="auth-input" />
                        </div>

                        <label className="remember-me" style={{ alignItems: 'flex-start' }}>
                            <input type="checkbox" style={{ marginTop: '3px' }} />
                            <span style={{ fontSize: '0.85rem', lineHeight: '1.4' }}> I agree to the <a href="#" className="forgot-link">Terms & Conditions</a> and <a href="#" className="forgot-link">Privacy Policy</a>.</span>
                        </label>

                        <button className="auth-btn-primary">Create Account</button>
                    </form>



                    <div className="partner-logos">
                        <div className="partner-text">TRUSTED BY TRADERS FROM</div>
                        <div className="logos-row">
                            <span>🏛 BANKONE</span>
                            <span>❖ CRYPTOCO</span>
                            <span>💴 WALLETHUB</span>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default Signup;
