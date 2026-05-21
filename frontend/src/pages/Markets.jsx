import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import { useMarket } from '../context/MarketContext';
import useStockPrice from '../hooks/useStockPrice';
import { MOCK_STOCKS } from '../data/mockStocks';
import './Markets.css';

const ALL_SYMBOLS = MOCK_STOCKS.map(s => s.symbol);
const SECTORS = ['All', ...new Set(MOCK_STOCKS.map(s => s.sector))];

const BuyModal = ({ stock, onClose, onBuy }) => {
    const [qty, setQty] = useState(1);
    const total = (stock.price * qty).toFixed(2);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="buy-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h2>{stock.symbol}</h2>
                        <p className="modal-subtitle">{stock.name}</p>
                    </div>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="modal-price-row">
                    <div>
                        <span className="modal-label">Current Price</span>
                        <div className="modal-price">₹{stock.price.toLocaleString()}</div>
                    </div>
                    <div>
                        <span className="modal-label">Sector</span>
                        <div className="modal-sector-badge">{stock.sector}</div>
                    </div>
                </div>
                <div className="modal-qty-section">
                    <label className="modal-label">Quantity</label>
                    <div className="qty-controls">
                        <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                        <input type="number" value={qty} min={1}
                            onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))} />
                        <button onClick={() => setQty(qty + 1)}>+</button>
                    </div>
                </div>
                <div className="modal-total">
                    Total Cost: <strong>₹{parseFloat(total).toLocaleString()}</strong>
                </div>
                <button className="modal-buy-btn" onClick={() => { onBuy(stock, qty); onClose(); }}>
                    Confirm Buy — ₹{parseFloat(total).toLocaleString()}
                </button>
            </div>
        </div>
    );
};

const Markets = () => {
    const navigate = useNavigate();
    const { buyStock, addToWatchlist, removeFromWatchlist, watchlist } = useMarket();
    const { data: stockData = [], loading } = useStockPrice(ALL_SYMBOLS);
    const [search, setSearch] = useState('');
    const [sector, setSector] = useState('All');
    const [sortBy, setSortBy] = useState('name'); // 'name' | 'price' | 'change'
    const [buyModal, setBuyModal] = useState(null);

    const filtered = useMemo(() => {
        return stockData
            .filter(s => {
                const matchSearch = s.name.toLowerCase().includes(search.toLowerCase())
                    || s.symbol.toLowerCase().includes(search.toLowerCase());
                const matchSector = sector === 'All' || s.sector === sector;
                return matchSearch && matchSector;
            })
            .sort((a, b) => {
                if (sortBy === 'price') return b.price - a.price;
                if (sortBy === 'change') return b.change - a.change;
                return a.name.localeCompare(b.name);
            });
    }, [stockData, search, sector, sortBy]);

    return (
        <div className="markets-page">
            {buyModal && (
                <BuyModal
                    stock={stockData.find(s => s.symbol === buyModal.symbol) || buyModal}
                    onClose={() => setBuyModal(null)}
                    onBuy={buyStock}
                />
            )}

            <header className="markets-header">
                <div>
                    <h1 className="page-title">Market Overview</h1>
                    <p className="page-subtitle">{stockData.length} Nifty 50 stocks — Live NSE data</p>
                </div>
            </header>

            {/* Controls */}
            <div className="markets-controls">
                <div className="markets-search">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search stocks..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <div className="markets-filters">
                    {SECTORS.map(s => (
                        <button
                            key={s}
                            className={`sector-btn ${sector === s ? 'active' : ''}`}
                            onClick={() => setSector(s)}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    <option value="name">Sort: Name</option>
                    <option value="price">Sort: Price ↓</option>
                    <option value="change">Sort: Change ↓</option>
                </select>
            </div>

            <div className="markets-grid">
                {loading ? (
                    [1, 2, 3, 4, 5, 6].map(i => (
                        <Card key={i} className="market-card loading">
                            <div className="skeleton title"></div>
                            <div className="skeleton price"></div>
                            <div className="skeleton button"></div>
                        </Card>
                    ))
                ) : filtered.length > 0 ? (
                    filtered.map(stock => (
                        <Card key={stock.symbol} className="market-card">
                            <div className="market-card-header">
                                <div className="ticker-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <button
                                        className={`watchlist-btn ${watchlist.some(item => item.ticker === stock.symbol) ? 'active' : ''}`}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            fontSize: '18px',
                                            cursor: 'pointer',
                                            padding: '0',
                                            lineHeight: '1',
                                            color: watchlist.some(item => item.ticker === stock.symbol) ? '#f59e0b' : '#94a3b8'
                                        }}
                                        onClick={() => {
                                            const isInWatchlist = watchlist.some(item => item.ticker === stock.symbol);
                                            if (isInWatchlist) {
                                                removeFromWatchlist(stock.symbol);
                                            } else {
                                                addToWatchlist(stock.symbol, stock.name);
                                            }
                                        }}
                                    >
                                        {watchlist.some(item => item.ticker === stock.symbol) ? '★' : '☆'}
                                    </button>
                                    <span className="market-ticker">{stock.symbol}</span>
                                </div>
                                <span className={`market-change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                                    {stock.change >= 0 ? '+' : ''}{stock.change?.toFixed(2)}%
                                </span>
                            </div>
                            <div className="market-info">
                                <h3 className="market-name">{stock.name}</h3>
                                <div className="market-price">₹{stock.price?.toLocaleString()}</div>
                                <div className="market-meta">
                                    <span className="market-sector">{stock.sector}</span>
                                    <span className="market-volume">Vol: {stock.volume}</span>
                                </div>
                            </div>
                            <div className="market-actions" style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn-secondary" style={{ flex: 1 }} onClick={(e) => { e.stopPropagation(); navigate(`/stock/${stock.symbol}`); }}>Details</button>
                                <button className="btn-primary" style={{ flex: 1 }} onClick={() => setBuyModal(stock)}>Buy</button>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="no-data">No stocks match your search.</div>
                )}
            </div>
        </div>
    );
};

export default Markets;