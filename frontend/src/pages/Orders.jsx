import { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import Card from '../components/Card';
import './Orders.css';

// Simple Skeleton component (same as Dashboard)
const Skeleton = ({ type }) => {
    let height = '20px';
    let width = '100%';
    if (type === 'title') height = '24px';
    if (type === 'text') height = '18px';
    if (type === 'button') { height = '36px'; width = '80%'; }
    if (type === 'list-item') height = '16px';
    return <div className={`skeleton ${type}`} style={{ height, width }} />;
};

// StatCard component
const StatCard = ({ title, value, subtext, icon, type }) => (
    <Card className="order-stat-card">
        <div className="stat-header">
            <span className="stat-title">{title}</span>
            <span className={`stat-icon-wrapper ${type}`}>{icon}</span>
        </div>
        <div className="stat-value">{value}</div>
        <div className={`stat-subtext ${type}`}>{subtext}</div>
    </Card>
);

const Orders = () => {
    const { orders = [], loading } = useMarket();
    const [filter, setFilter] = useState('ALL'); // 'ALL', 'BUY', 'SELL'
    const [search, setSearch] = useState('');

    // Dynamic Stats
    const stats = {
        total: orders.length,
        completed: orders.filter(o => o.status === 'COMPLETED').length,
        pending: orders.filter(o => o.status === 'PENDING').length,
        cancelled: orders.filter(o => o.status === 'CANCELLED' || o.status === 'FAILED').length
    };

    const filteredOrders = orders.filter(o => {
        const matchesFilter = filter === 'ALL' || o.type === filter;
        const matchesSearch = o.stockName?.toLowerCase().includes(search.toLowerCase()) ||
            o.ticker?.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    // Show skeleton placeholders while loading
    if (loading) return (
        <div className="orders-page container fade-in">
            <Card className="orders-card">
                <Skeleton type="title" />
                <div className="skeleton" style={{ height: '500px', marginTop: '10px' }} />
            </Card>
        </div>
    );

    return (
        <div className="orders-page container fade-in">
            <div className="page-header">
                <h1>Order History</h1>
                <p>Track your trading activity and order status across Real and Demo modes</p>
            </div>

            <div className="stats-grid">
                <StatCard
                    title="Total Orders"
                    value={stats.total}
                    subtext="All time orders"
                    type="primary"
                    icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                />
                <StatCard
                    title="Completed"
                    value={stats.completed}
                    subtext="Successfully executed"
                    type="success"
                    icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>}
                />
                <StatCard
                    title="Pending"
                    value={stats.pending}
                    subtext="Awaiting execution"
                    type="warning"
                    icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>}
                />
                <StatCard
                    title="Cancelled"
                    value={stats.cancelled}
                    subtext="Failed or revoked"
                    type="danger"
                    icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>}
                />
            </div>

            {/* Orders Table */}
            <Card className="orders-content-card">
                <div className="filters-toolbar">
                    <div className="type-filters">
                        <button className={filter === 'ALL' ? 'active' : ''} onClick={() => setFilter('ALL')}>All Orders</button>
                        <button className={filter === 'BUY' ? 'active' : ''} onClick={() => setFilter('BUY')}>Buys</button>
                        <button className={filter === 'SELL' ? 'active' : ''} onClick={() => setFilter('SELL')}>Sells</button>
                    </div>
                    <div className="toolbar-search">
                        <input
                            type="text"
                            placeholder="Search by stock..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-wrapper">
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>DATE</th>
                                <th>TYPE</th>
                                <th>ASSET</th>
                                <th>QTY</th>
                                <th>PRICE</th>
                                <th>TOTAL AMOUNT</th>
                                <th>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                                <tr key={order.id}>
                                    <td className="col-date">{order.date}</td>
                                    <td>
                                        <span className={`type-badge ${order.type.toLowerCase()}`}>
                                            {order.type}
                                        </span>
                                    </td>
                                    <td className="col-asset">
                                        <div className="stock-cell">
                                            <div className="stock-icon-s">{order.ticker[0]}</div>
                                            <div className="asset-info">
                                                <div className="stock-name-text">{order.stockName}</div>
                                                <div className="asset-ticker">{order.ticker}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="col-qty">{order.qty}</td>
                                    <td className="col-price">₹{order.price.toLocaleString()}</td>
                                    <td className="col-amount">₹{order.totalAmount.toLocaleString()}</td>
                                    <td className="col-status">
                                        <span className={`status-pill ${order.status.toLowerCase()}`}>
                                            <span className="dot"></span>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="no-orders">No orders found matching your criteria.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="table-footer">
                    <span>Showing <strong>{filteredOrders.length}</strong> of <strong>{orders.length}</strong> orders</span>

                </div>
            </Card>
        </div>
    );
};

export default Orders;