import { useState, useMemo } from 'react';
import { useMarket } from '../context/MarketContext';
import Card from '../components/Card';
import Skeleton from '../components/Skeleton';
import './Portfolio.css';

const SellModal = ({ holding, onClose, onSell }) => {
    const [qty, setQty] = useState(1);
    const total = (holding.ltp * qty).toFixed(2);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="buy-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h2>{holding.ticker}</h2>
                        <p className="modal-subtitle">Sell Shares</p>
                    </div>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="modal-price-row">
                    <div>
                        <span className="modal-label">Current Price</span>
                        <div className="modal-price">₹{holding.ltp.toLocaleString()}</div>
                    </div>
                </div>
                <div className="modal-qty-section">
                    <label className="modal-label">Quantity to Sell (Max {holding.qty})</label>
                    <div className="qty-controls">
                        <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                        <input type="number" value={qty} min={1} max={holding.qty}
                            onChange={e => setQty(Math.min(holding.qty, Math.max(1, parseInt(e.target.value) || 1)))} />
                        <button onClick={() => setQty(Math.min(holding.qty, qty + 1))}>+</button>
                    </div>
                </div>
                <div style={{ padding: '10px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>Total Value</span>
                        <span>₹{parseFloat(total).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>Platform Fee (2%)</span>
                        <span style={{ color: '#ef4444' }}>- ₹{(total * 0.02).toFixed(2).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                        <span>Net to Receive</span>
                        <span style={{ color: '#22c55e' }}>₹{(total * 0.98).toFixed(2).toLocaleString()}</span>
                    </div>
                </div>
                <button className="modal-buy-btn" style={{ background: '#ef4444' }} onClick={() => { onSell(holding, qty); onClose(); }}>
                    Confirm Sell — ₹{(total * 0.98).toFixed(2).toLocaleString()}
                </button>
            </div>
        </div>
    );
};

const HoldingsTable = ({ holdings, onOpenSell }) => {
    return (
        <div className="holdings-table-container">
            <table className="holdings-table">
                <thead>
                    <tr>
                        <th>STOCK NAME</th>
                        <th>QTY</th>
                        <th>AVG. PRICE</th>
                        <th>LTP</th>
                        <th>P&amp;L</th>
                        <th>ACTION</th>
                    </tr>
                </thead>
                <tbody>
                    {holdings.map((stock) => (
                        <tr key={stock.id}>
                            <td>
                                <div className="stock-info">
                                    <div className="stock-name">{stock.name}</div>
                                    <div className="stock-ticker">{stock.ticker}</div>
                                </div>
                            </td>
                            <td>{stock.qty}</td>
                            <td>₹{stock.avgPrice.toFixed(2)}</td>
                            <td>₹{stock.ltp.toFixed(2)}</td>
                            <td>
                                <div className={`pnl-value ${stock.pnl >= 0 ? 'text-success' : 'text-danger'}`}>
                                    {stock.pnl >= 0 ? '+' : ''}₹{Math.abs(stock.pnl).toFixed(2)}
                                </div>
                                <div className={`pnl-percent ${stock.pnl >= 0 ? 'text-success' : 'text-danger'}`}>
                                    {stock.pnl >= 0 ? '+' : ''}{stock.pnlPercent}%
                                </div>
                            </td>
                            <td>
                                <button
                                    className="sell-btn"
                                    onClick={() => onOpenSell(stock)}
                                >
                                    SELL
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const Portfolio = () => {
    const { portfolioValue, investedAmount, totalPnL, totalPnLPercent, holdings, loading, sellStock } = useMarket();
    const [sellModal, setSellModal] = useState(null);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'GAINERS', 'LOSERS'

    const filteredHoldings = useMemo(() => {
        return holdings.filter(h => {
            const matchesSearch = h.name.toLowerCase().includes(search.toLowerCase()) ||
                h.ticker.toLowerCase().includes(search.toLowerCase());
            const matchesFilter = filterType === 'ALL' ||
                (filterType === 'GAINERS' && h.pnl > 0) ||
                (filterType === 'LOSERS' && h.pnl < 0);
            return matchesSearch && matchesFilter;
        });
    }, [holdings, search, filterType]);

    if (loading) return (
        <div className="portfolio-page container fade-in">
            <div className="stats-row">
                {[1, 2, 3].map(i => (
                    <Card key={i} className="stats-card">
                        <Skeleton type="text" className="skeleton-title" />
                        <Skeleton type="text" />
                    </Card>
                ))}
            </div>
            <Card className="holdings-card">
                <Skeleton type="title" />
                <div style={{ height: '400px' }} className="skeleton"></div>
            </Card>
        </div>
    );

    return (
        <div className="portfolio-page container fade-in">
            <div className="page-header">
                <h1>My Portfolio</h1>
                <p>Real-time performance and holdings summary</p>
            </div>

            <div className="stats-row">
                <Card className="stats-card">
                    <div className="stats-label">INVESTED AMOUNT</div>
                    <div className="stats-value">₹{investedAmount.toLocaleString()}</div>
                </Card>
                <Card className="stats-card">
                    <div className="stats-label">CURRENT VALUE</div>
                    <div className="stats-value highlight">₹{portfolioValue.toLocaleString()}</div>
                </Card>
                <Card className="stats-card">
                    <div className="stats-label">OVERALL P&L</div>
                    <div className="stats-value text-success">
                        {totalPnL >= 0 ? '+' : ''}₹{Math.abs(totalPnL).toLocaleString()}
                        <span className="pnl-badge">{totalPnL >= 0 ? '+' : ''}{totalPnLPercent}%</span>
                    </div>
                </Card>
            </div>

            <div className="holdings-section">
                <div className="controls-row">
                    <div className="search-holdings">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by stock name or ticker..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="action-buttons">
                        <div className="portfolio-filters">
                            <button
                                className={`filter-chip ${filterType === 'ALL' ? 'active' : ''}`}
                                onClick={() => setFilterType('ALL')}
                            >All</button>
                            <button
                                className={`filter-chip ${filterType === 'GAINERS' ? 'active' : ''}`}
                                onClick={() => setFilterType('GAINERS')}
                            >Gainers</button>
                            <button
                                className={`filter-chip ${filterType === 'LOSERS' ? 'active' : ''}`}
                                onClick={() => setFilterType('LOSERS')}
                            >Losers</button>
                        </div>
                    </div>
                </div>

                {sellModal && (
                    <SellModal
                        holding={sellModal}
                        onClose={() => setSellModal(null)}
                        onSell={sellStock}
                    />
                )}

                <Card className="table-card">
                    <HoldingsTable holdings={filteredHoldings} onOpenSell={setSellModal} />
                    <div className="pagination">
                        <span>Showing <strong>{filteredHoldings.length}</strong> of <strong>{holdings.length}</strong> holdings</span>
                        <div className="page-controls">
                            <button disabled>&lt;</button>
                            <button disabled>&gt;</button>
                        </div>
                    </div>
                </Card>
            </div>

            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-logo">
                        <div className="logo-icon small">ID</div>
                        <span>Investra Demo</span>
                    </div>
                    <div className="copyright">© 2024 Investra Platform</div>
                    <div className="footer-links">
                        <a href="#privacy" onClick={e => e.preventDefault()}>Privacy Policy</a>
                        <a href="#terms" onClick={e => e.preventDefault()}>Terms of Service</a>
                        <a href="mailto:support@investra.com">Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Portfolio;
