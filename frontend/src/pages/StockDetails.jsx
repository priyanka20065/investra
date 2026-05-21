import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMarket } from '../context/MarketContext';
import { useToast } from '../context/ToastContext';
import useStockPrice from '../hooks/useStockPrice';
import { MOCK_STOCKS } from '../data/mockStocks';
import Card from '../components/Card';
import StockChart from '../components/StockChart';
import FinancialsOverviewChart from '../components/FinancialsOverviewChart';
import './StockDetails.css';



const StockDetails = () => {
    const { ticker } = useParams();
    const navigate = useNavigate();
    const { balance, buyStock, sellStock, currentMode, watchlist, addToWatchlist, removeFromWatchlist } = useMarket();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('Overview');
    const [finType, setFinType] = useState('Revenue');
    const [chartType, setChartType] = useState('area'); // 'area' or 'candles'
    const [timeRange, setTimeRange] = useState('1M');
    const [qty, setQty] = useState(1);
    const [orderType, setOrderType] = useState('BUY');
    const [news, setNews] = useState([]);
    const [loadingNews, setLoadingNews] = useState(false);
    const [financials, setFinancials] = useState(null);

    const symbols = useMemo(() => [ticker], [ticker]);
    const { data: stockData, loading } = useStockPrice(symbols);

    // Fetch news & financials
    useEffect(() => {
        const fetchNews = async () => {
            setLoadingNews(true);
            try {
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
                const res = await fetch(`${baseUrl}/stocks/news/${ticker}`);
                const data = await res.json();
                if (data.success) {
                    setNews(data.data);
                }
            } catch (err) {
                console.error("Failed to fetch news:", err);
            } finally {
                setLoadingNews(false);
            }
        };

        const fetchFinancials = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
                const res = await fetch(`${baseUrl}/stocks/financials/${ticker}`);
                const data = await res.json();
                if (data.success && data.data && data.data.length > 0) {
                    setFinancials(data.data);
                }
            } catch (err) {
                console.error("Failed to fetch financials:", err);
            }
        };

        fetchNews();
        fetchFinancials();
    }, [ticker]);

    const isInWatchlist = watchlist.some(item => item.ticker === ticker);

    // Similar stocks — match by sector from MOCK_STOCKS static data
    const currentStockMeta = useMemo(() => MOCK_STOCKS.find(s => s.symbol === ticker), [ticker]);
    const similarStocks = useMemo(() => {
        if (!currentStockMeta) return [];
        return MOCK_STOCKS
            .filter(s => s.symbol !== ticker && s.sector === currentStockMeta.sector)
            .slice(0, 4);
    }, [ticker, currentStockMeta]);

    // Merge real-time data with static metadata
    const stock = useMemo(() => {
        const realData = stockData?.[0] || {};
        const meta = currentStockMeta || {};
        const basePrice = meta.basePrice || realData.basePrice || 1000;
        const price = realData.price || basePrice;
        const change = realData.change || 0;
        return {
            name: realData.name || meta.name || ticker,
            ticker: ticker,
            price,
            change,
            open: realData.open || parseFloat((basePrice * 0.998).toFixed(2)),
            high: realData.high || parseFloat((basePrice * 1.012).toFixed(2)),
            low: realData.low || parseFloat((basePrice * 0.988).toFixed(2)),
            prevClose: realData.prevClose || parseFloat(basePrice.toFixed(2)),
            vol: realData.volume || meta.volume || '1.2M',
            mktCap: realData.mktCap || meta.mktCap || '5.4T',
            peRatio: realData.peRatio || '24.5',
            divYield: realData.divYield || '1.2%',
            high52w: realData.high52w || parseFloat((basePrice * 1.35).toFixed(2)),
            low52w: realData.low52w || parseFloat((basePrice * 0.72).toFixed(2)),
            sector: meta.sector || 'Unknown',
        };
    }, [stockData, ticker, currentStockMeta]);

    const isPositive = stock.change >= 0;

    // Performance indicator positions (calculated from actual data)
    const todayIndicator = useMemo(() => {
        const range = stock.high - stock.low;
        if (range === 0) return 50;
        return ((stock.price - stock.low) / range) * 100;
    }, [stock.price, stock.high, stock.low]);

    const yearIndicator = useMemo(() => {
        const range = stock.high52w - stock.low52w;
        if (range === 0) return 50;
        return ((stock.price - stock.low52w) / range) * 100;
    }, [stock.price, stock.high52w, stock.low52w]);

    // Mock Historical Data for Price Chart
    const chartData = useMemo(() => {
        if (!stock || !stock.price || isNaN(stock.price)) {
            return [];
        }
        
        const data = [];
        const now = new Date();
        let close = stock.price * 0.95;
        
        let numPoints = 100;
        let timeStepSeconds = 86400; // 1 day
        
        if (timeRange === '1D') {
            numPoints = 48; // 24 hours, 30 min intervals
            timeStepSeconds = 1800;
            close = stock.price * 0.99; // Less volatility for 1D
        } else if (timeRange === '1W') {
            numPoints = 42; // 7 days, 4 hour intervals
            timeStepSeconds = 14400;
            close = stock.price * 0.97;
        } else if (timeRange === '1M') {
            numPoints = 30;
            timeStepSeconds = 86400;
        } else if (timeRange === '3M') {
            numPoints = 90;
            timeStepSeconds = 86400;
        } else if (timeRange === '1Y') {
            numPoints = 250; // standard trading days in a year
            timeStepSeconds = 86400;
        } else if (timeRange === 'ALL') {
            numPoints = 500;
            timeStepSeconds = 86400;
        }
        
        for (let i = numPoints; i >= 0; i--) {
            const date = new Date(now.getTime() - i * timeStepSeconds * 1000);
            const timeVal = Math.floor(date.getTime() / 1000);
            
            const open = close;
            const volatilityFactor = timeRange === '1D' ? 0.003 : timeRange === '1W' ? 0.008 : 0.02;
            const fluctuation = (Math.random() - 0.48) * (close * volatilityFactor);
            close = open + fluctuation;
            const high = Math.max(open, close) + Math.random() * (close * (volatilityFactor * 0.2));
            const low = Math.min(open, close) - Math.random() * (close * (volatilityFactor * 0.2));

            if (chartType === 'candles') {
                data.push({
                    time: timeVal,
                    open: parseFloat(open.toFixed(2)),
                    high: parseFloat(high.toFixed(2)),
                    low: parseFloat(low.toFixed(2)),
                    close: parseFloat(close.toFixed(2))
                });
            } else {
                data.push({
                    time: timeVal,
                    value: parseFloat(close.toFixed(2))
                });
            }
        }
        return data;
    }, [stock.ticker, stock.price, chartType, timeRange]);

    // FIX: sellStock expects a holding-like object, not a raw ticker string
    const handleTransaction = async () => {
        let success = false;
        if (orderType === 'BUY') {
            success = await buyStock(stock, parseInt(qty), stock.price);
        } else {
            // Build a holding-like object that sellStock expects
            const holdingObj = {
                name: stock.name,
                stockName: stock.name,
                ticker: stock.ticker,
                ltp: stock.price,
            };
            success = await sellStock(holdingObj, parseInt(qty));
        }
        if (success) {
            showToast(`${orderType === 'BUY' ? 'Purchase' : 'Sale'} successful!`, 'success');
            navigate('/orders');
        }
    };

    if (loading) {
        return (
            <div className="container" style={{ padding: '2rem' }}>
                <Card><div className="skeleton" style={{ height: '400px' }}></div></Card>
            </div>
        );
    }

    return (
        <div className="stock-details-page fade-in">
            <div className="sd-container">
                {/* ─── Left Column ─── */}
                <div className="sd-left">
                    <header className="sd-header">
                        <div className="sd-title-section">
                            <div className="sd-identity">
                                <div className="sd-icon-large">{stock.ticker[0]}</div>
                                <div>
                                    <h1 className="sd-name">{stock.name}</h1>
                                    <div className="sd-ticker-badge">{stock.ticker} · NSE · {stock.sector}</div>
                                </div>
                            </div>
                            <button
                                className={`sd-watchlist-btn ${isInWatchlist ? 'active' : ''}`}
                                onClick={() => isInWatchlist ? removeFromWatchlist(ticker) : addToWatchlist(ticker, stock.name)}
                            >
                                {isInWatchlist ? '★ Watching' : '☆ Watchlist'}
                            </button>
                        </div>

                        <div className="sd-price-section">
                            <div className="sd-main-price">
                                <span className="currency">₹</span>
                                <span className="amount">{stock.price.toLocaleString()}</span>
                            </div>
                            <div className={`sd-price-change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                                <span className="change-badge">
                                    {stock.change >= 0 ? '▲' : '▼'} {Math.abs(stock.change)}%
                                </span>
                                <span className="abs-change">
                                    ({stock.change >= 0 ? '+' : ''}{(stock.price * stock.change / 100).toFixed(2)})
                                </span>
                            </div>
                        </div>
                    </header>

                    {/* ─── Tab Navigation ─── */}
                    <div className="sd-tabs-nav">
                        {['Overview', 'Financials', 'News'].map(t => (
                            <button
                                key={t}
                                className={`sd-tab-link ${activeTab === t ? 'active' : ''}`}
                                onClick={() => setActiveTab(t)}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    {/* ═══════ OVERVIEW TAB ═══════ */}
                    {activeTab === 'Overview' && (
                        <>
                            {/* Main Price Chart */}
                            <div className="sd-chart-box">
                                <div className="chart-controls">
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <h3>Price History</h3>
                                        <div className="range-selector" style={{ background: 'var(--bg-secondary)', padding: '2px', borderRadius: '6px' }}>
                                            <button 
                                                className={chartType === 'area' ? 'active' : ''} 
                                                onClick={() => setChartType('area')}
                                                style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                                            >
                                                Line
                                            </button>
                                            <button 
                                                className={chartType === 'candles' ? 'active' : ''} 
                                                onClick={() => setChartType('candles')}
                                                style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                                            >
                                                Candles
                                            </button>
                                        </div>
                                    </div>
                                    <div className="range-selector">
                                        {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map(r => (
                                            <button 
                                                key={r} 
                                                className={r === timeRange ? 'active' : ''}
                                                onClick={() => setTimeRange(r)}
                                            >
                                                {r}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <StockChart data={chartData} type={chartType} />
                            </div>

                            {/* Performance */}
                            <div className="sd-performance-section">
                                <div className="section-header"><h3>Performance</h3></div>
                                <div className="perf-grid">
                                    <div className="perf-item full-width">
                                        <div className="perf-labels">
                                            <span>Today's Low</span>
                                            <span>Today's High</span>
                                        </div>
                                        <div className="perf-bar-wrapper">
                                            <span className="val">₹{stock.low.toLocaleString()}</span>
                                            <div className="perf-bar">
                                                <div className="perf-indicator" style={{ left: `${todayIndicator}%` }}></div>
                                            </div>
                                            <span className="val">₹{stock.high.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="perf-item full-width">
                                        <div className="perf-labels">
                                            <span>52W Low</span>
                                            <span>52W High</span>
                                        </div>
                                        <div className="perf-bar-wrapper">
                                            <span className="val">₹{stock.low52w.toLocaleString()}</span>
                                            <div className="perf-bar">
                                                <div className="perf-indicator" style={{ left: `${yearIndicator}%` }}></div>
                                            </div>
                                            <span className="val">₹{stock.high52w.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="sd-details-grid">
                                {[
                                    { label: 'Open', value: `₹${stock.open.toLocaleString()}` },
                                    { label: 'Prev. Close', value: `₹${stock.prevClose.toLocaleString()}` },
                                    { label: 'Volume', value: stock.vol },
                                    { label: 'Market Cap', value: `₹${stock.mktCap}` },
                                    { label: 'P/E Ratio', value: stock.peRatio },
                                    { label: 'Div. Yield', value: stock.divYield },
                                ].map(item => (
                                    <div key={item.label} className="sd-info-card">
                                        <span className="label">{item.label}</span>
                                        <span className="value">{item.value}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Shareholding */}
                            <div className="sd-shareholding-section">
                                <h3>Shareholding Pattern</h3>
                                <div className="shareholding-bars">
                                    {[
                                        { label: 'Promoters', value: 50.4, color: '#3b82f6' },
                                        { label: 'FII', value: 24.2, color: '#10b981' },
                                        { label: 'DII', value: 15.8, color: '#f59e0b' },
                                        { label: 'Retail & Others', value: 9.6, color: '#94a3b8' },
                                    ].map(item => (
                                        <div key={item.label} className="sh-item">
                                            <div className="sh-info">
                                                <span>{item.label}</span>
                                                <strong>{item.value}%</strong>
                                            </div>
                                            <div className="sh-progress">
                                                <div className="sh-fill" style={{ width: `${item.value}%`, background: item.color }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* ═══════ FINANCIALS TAB ═══════ */}
                    {activeTab === 'Financials' && (
                        <Card className="sd-financials-card">
                            <div className="fin-header">
                                <div className="fin-title">
                                    <h3>Financials</h3>
                                    <span className="fin-period">Annual</span>
                                </div>
                                <div className="fin-type-switcher">
                                    {['Revenue', 'Profit', 'Net Worth'].map(type => (
                                        <button
                                            key={type}
                                            className={`fin-type-btn ${finType === type ? 'active' : ''}`}
                                            onClick={() => setFinType(type)}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="financials-viz">
                                <FinancialsOverviewChart 
                                    data={financials || [
                                        { year: '2020', rev: 450, prof: 80, nw: 1200 },
                                        { year: '2021', rev: 520, prof: 95, nw: 1400 },
                                        { year: '2022', rev: 680, prof: 130, nw: 1800 },
                                        { year: '2023', rev: 840, prof: 190, nw: 2300 },
                                        { year: '2024', rev: 1100, prof: 260, nw: 2900 },
                                    ]} 
                                    type={finType} 
                                />
                            </div>
                            <div className="fin-footer">
                                <p>All values in Crores (₹)</p>
                            </div>
                        </Card>
                    )}

                    {/* ═══════ NEWS TAB ═══════ */}
                    {activeTab === 'News' && (
                        <div className="sd-news-list">
                            {loadingNews ? (
                                <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-modest)' }}>Loading latest news...</p>
                            ) : news.length === 0 ? (
                                <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-modest)' }}>No recent news found for {stock.name}.</p>
                            ) : (
                                news.map((n, i) => (
                                    <div key={i} style={{ textDecoration: 'none' }}>
                                        <Card className="news-card" onClick={() => window.open(n.link, '_blank')}>
                                            <div className="news-meta">{n.source} · {n.time}</div>
                                            <h4 className="news-title">{n.title}</h4>
                                        </Card>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Similar Stocks (always visible) */}
                    {similarStocks.length > 0 && (
                        <div className="sd-similar-section">
                            <h3>Similar Stocks</h3>
                            <div className="similar-grid">
                                {similarStocks.map(s => (
                                    <Card key={s.symbol} className="similar-card" onClick={() => navigate(`/stock/${s.symbol}`)}>
                                        <span className="sim-ticker">{s.symbol}</span>
                                        <div className="sim-price">₹{s.basePrice.toLocaleString()}</div>
                                        <div className={`sim-change ${s.change >= 0 ? 'pos' : 'neg'}`}>
                                            {s.change >= 0 ? '+' : ''}{s.change}%
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ─── Right Column: Trading Panel ─── */}
                <div className="sd-right">
                    <Card className="trading-panel-card">
                        <div className="trading-tabs">
                            <button
                                className={`tab-btn buy ${orderType === 'BUY' ? 'active' : ''}`}
                                onClick={() => setOrderType('BUY')}
                            >
                                BUY
                            </button>
                            <button
                                className={`tab-btn sell ${orderType === 'SELL' ? 'active' : ''}`}
                                onClick={() => setOrderType('SELL')}
                            >
                                SELL
                            </button>
                        </div>

                        <div className="trading-form">
                            <div className="form-row">
                                <label>Quantity</label>
                                <input
                                    type="number"
                                    value={qty}
                                    onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                                    min="1"
                                />
                            </div>
                            <div className="form-row">
                                <label>Price</label>
                                <div className="price-input-mock">
                                    <span className="market-tag">MARKET</span>
                                    <span>₹{stock.price.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="balance-info">
                                <span>{currentMode === 'REAL' ? 'Available Payout' : 'Demo Balance'}</span>
                                <strong>₹{balance.toLocaleString()}</strong>
                            </div>

                            <div className="total-execution">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                    <span>Total Value</span>
                                    <span>₹{(stock.price * qty).toLocaleString()}</span>
                                </div>
                                {orderType === 'SELL' && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                        <span>Platform Fee (2%)</span>
                                        <span style={{ color: '#ef4444' }}>- ₹{(stock.price * qty * 0.02).toFixed(2).toLocaleString()}</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                                    <span className="total-label">{orderType === 'SELL' ? 'Net to Receive' : 'Total Amount'}</span>
                                    <span className="total-amount">
                                        ₹{orderType === 'SELL' 
                                            ? (stock.price * qty * 0.98).toFixed(2).toLocaleString() 
                                            : (stock.price * qty).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {currentMode === 'REAL' && balance < (stock.price * qty) && orderType === 'BUY' && (
                                <div className="balance-warning" style={{ color: '#ef4444', fontSize: '11px', marginTop: '10px', textAlign: 'center' }}>
                                    ⚠️ Your REAL balance is insufficient. Add funds or switch to DEMO mode.
                                </div>
                            )}

                            <button
                                className={`execute-btn ${orderType.toLowerCase()}`}
                                onClick={handleTransaction}
                            >
                                {orderType} {stock.ticker}
                            </button>
                            <p className="execution-hint">
                                {currentMode === 'REAL'
                                    ? 'Funds will be deducted directly from your available balance.'
                                    : 'Using demo money. No real money involved.'}
                            </p>
                        </div>
                    </Card>

                    <Card className="expert-card">
                        <div className="expert-header">
                            <span className="expert-badge">ANALYST VIEW</span>
                            <h4>Buy Sentiment</h4>
                        </div>
                        <div className="sentiment-meter">
                            <div className="meter-fill" style={{ width: '78%', background: '#22c55e' }}></div>
                        </div>
                        <div className="sentiment-labels">
                            <span>Strong Buy</span>
                            <span>78%</span>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default StockDetails;
