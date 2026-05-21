import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMarket } from '../context/MarketContext';
import { useAuth } from '../context/AuthContext';
import { MOCK_STOCKS } from '../data/mockStocks';
import useStockPrice from '../hooks/useStockPrice';
import Card from '../components/Card';
import Skeleton from '../components/Skeleton';
import './Dashboard.css';

const Dashboard = () => {
    const { portfolioValue, investedAmount, totalPnL, totalPnLPercent, orders, holdings, loading: marketLoading } = useMarket();
    const { user } = useAuth();
    const navigate = useNavigate();

    const allSymbols = useMemo(() => MOCK_STOCKS.map(s => s.symbol), []);
    const { data: stocks, loading: stocksLoading } = useStockPrice(allSymbols);
    const loading = marketLoading || stocksLoading;

    const topMovers = useMemo(() => {
        if (!stocks || stocks.length === 0) return [];
        return [...stocks].sort((a, b) => Math.abs(b.change || 0) - Math.abs(a.change || 0)).slice(0, 5);
    }, [stocks]);

    const topGainers = useMemo(() => {
        if (!stocks || stocks.length === 0) return [];
        return [...stocks].filter(s => (s.change || 0) > 0).sort((a, b) => (b.change || 0) - (a.change || 0)).slice(0, 3);
    }, [stocks]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    if (loading) return (
        <div className="dashboard-page fade-in">
            <div className="dash-hero skeleton-hero">
                <Skeleton type="title" />
                <Skeleton type="text" />
            </div>
            <div className="dash-stats-grid">
                {[1, 2, 3, 4].map(i => (
                    <Card key={i} className="dash-stat-card">
                        <Skeleton type="text" />
                        <Skeleton type="text" />
                    </Card>
                ))}
            </div>
        </div>
    );

    const pnlPercent = totalPnLPercent || 0;
    const holdingsCount = holdings?.length || 0;
    const ordersCount = orders?.length || 0;

    return (
        <div className="dashboard-page fade-in">
            {/* Hero Section */}
            <div className="dash-hero">
                <div className="dash-hero-content">
                    <div className="dash-greeting">
                        <h1>{getGreeting()}, <span className="dash-username">{user?.name?.split(' ')[0] || 'Trader'}</span> 👋</h1>
                        <p className="dash-subtitle">Here's your portfolio overview for today</p>
                    </div>
                    <div className="dash-hero-actions">
                        <button className="dash-btn-primary" onClick={() => navigate('/markets')}>
                            <span>📈</span> Explore Markets
                        </button>
                        <button className="dash-btn-secondary" onClick={() => navigate('/portfolio')}>
                            <span>💼</span> My Portfolio
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="dash-stats-grid">
                <div className="dash-stat-card">
                    <div className="stat-icon stat-icon-portfolio">💰</div>
                    <div className="stat-info">
                        <span className="stat-label">Portfolio Value</span>
                        <span className="stat-value">₹{portfolioValue.toLocaleString()}</span>
                    </div>
                </div>
                <div className="dash-stat-card">
                    <div className="stat-icon stat-icon-invested">📊</div>
                    <div className="stat-info">
                        <span className="stat-label">Invested</span>
                        <span className="stat-value">₹{investedAmount.toLocaleString()}</span>
                    </div>
                </div>
                <div className="dash-stat-card">
                    <div className={`stat-icon ${totalPnL >= 0 ? 'stat-icon-profit' : 'stat-icon-loss'}`}>
                        {totalPnL >= 0 ? '📈' : '📉'}
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Total P&L</span>
                        <span className={`stat-value ${totalPnL >= 0 ? 'text-success' : 'text-danger'}`}>
                            {totalPnL >= 0 ? '+' : '-'}₹{Math.abs(totalPnL).toLocaleString()}
                            <small className="stat-percent">({totalPnL >= 0 ? '+' : ''}{pnlPercent}%)</small>
                        </span>
                    </div>
                </div>
                <div className="dash-stat-card">
                    <div className="stat-icon stat-icon-holdings">🏦</div>
                    <div className="stat-info">
                        <span className="stat-label">Holdings</span>
                        <span className="stat-value">{holdingsCount} <small className="stat-percent">stocks</small></span>
                    </div>
                </div>
            </div>


            {/* Bottom Grid: Top Movers + Recent Activity */}
            <div className="dash-bottom-grid">
                {/* Top Movers */}
                <div className="dash-section">
                    <div className="dash-section-header">
                        <h2 className="dash-section-title">🔥 Top Movers</h2>
                        <button className="dash-link-btn" onClick={() => navigate('/markets')}>View All →</button>
                    </div>
                    <div className="dash-movers-list">
                        {topMovers.map((item, idx) => (
                            <div key={idx} className="dash-mover-item" onClick={() => navigate(`/stock/${item.symbol}`)}>
                                <div className="mover-rank">{idx + 1}</div>
                                <div className="mover-info">
                                    <span className="mover-ticker">{item.symbol}</span>
                                    <span className="mover-name">{item.name}</span>
                                </div>
                                <div className="mover-price">₹{item.price?.toLocaleString()}</div>
                                <div className={`mover-change ${(item.change || 0) >= 0 ? 'change-up' : 'change-down'}`}>
                                    {(item.change || 0) >= 0 ? '▲' : '▼'} {Math.abs(item.change || 0).toFixed(2)}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="dash-section">
                    <div className="dash-section-header">
                        <h2 className="dash-section-title">📋 Recent Activity</h2>
                        <button className="dash-link-btn" onClick={() => navigate('/orders')}>View All →</button>
                    </div>
                    <div className="dash-activity-list">
                        {orders.length === 0 ? (
                            <div className="dash-empty-state">
                                <div className="empty-icon">📭</div>
                                <p>No trades yet. Start by exploring the markets!</p>
                                <button className="dash-btn-primary small" onClick={() => navigate('/markets')}>Start Trading</button>
                            </div>
                        ) : (
                            orders.slice(0, 5).map(tx => (
                                <div key={tx.id} className="dash-activity-item">
                                    <div className={`activity-badge ${tx.type === 'BUY' ? 'badge-buy' : 'badge-sell'}`}>
                                        {tx.type === 'BUY' ? 'B' : 'S'}
                                    </div>
                                    <div className="activity-meta">
                                        <span className="activity-stock">{tx.stock}</span>
                                        <span className="activity-date">{tx.date}</span>
                                    </div>
                                    <div className="activity-right">
                                        <span className="activity-amt">₹{tx.totalAmount?.toLocaleString()}</span>
                                        <span className={`activity-status-pill ${tx.status === 'EXECUTED' ? 'status-success' : 'status-other'}`}>
                                            {tx.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Trending Stocks Banner */}
            {topGainers.length > 0 && (
                <div className="dash-trending-banner">
                    <div className="trending-label">🟢 Trending Up:</div>
                    <div className="trending-stocks">
                        {topGainers.map((s, i) => (
                            <span key={i} className="trending-chip" onClick={() => navigate(`/stock/${s.symbol}`)}>
                                {s.symbol} <span className="trending-pct">+{(s.change || 0).toFixed(1)}%</span>
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;