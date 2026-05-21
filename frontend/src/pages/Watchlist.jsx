import Card from '../components/Card';
import { useMarket } from '../context/MarketContext';
import { useNavigate } from 'react-router-dom';
import './Watchlist.css';

const Watchlist = () => {
    const { watchlistStocks = [], buyStock, removeFromWatchlist } = useMarket();
    const navigate = useNavigate();

    return (
        <div className="watchlist-page">
            <header className="watchlist-header">
                <div>
                    <h1 className="page-title">My Watchlist</h1>
                    <p className="page-subtitle">Real-time tracking of your favorite stocks</p>
                </div>
            </header>

            {watchlistStocks.length > 0 ? (
                <div className="stock-grid">
                    {watchlistStocks.map((stock) => (
                        <Card key={stock.id} className="stock-card">
                            <div className="card-header">
                                <div className="stock-icon-wrapper">
                                    <span className="stock-icon-text">{stock.ticker[0]}</span>
                                </div>
                                <button className="delete-btn" onClick={() => removeFromWatchlist(stock.ticker)}>
                                    🗑️
                                </button>
                            </div>
                            <div className="stock-info">
                                <h3 className="stock-ticker">{stock.ticker}</h3>
                                <p className="stock-name">{stock.name}</p>
                            </div>
                            <div className="stock-price-section">
                                <span className="current-price">₹{stock.price.toLocaleString()}</span>
                                <span className={`price-change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                                    {stock.change >= 0 ? '+' : ''}{stock.change}%
                                </span>
                            </div>
                            <button className="btn-primary full-width" onClick={() => buyStock(stock)}>Buy Stock</button>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-icon-bg">📉</div>
                    <h3>Your watchlist is empty</h3>
                    <p>Start following stocks to track their performance here.</p>
                    <button className="btn-primary" onClick={() => navigate('/markets')}>Explore Markets</button>
                </div>
            )}
        </div>
    );
};

export default Watchlist;