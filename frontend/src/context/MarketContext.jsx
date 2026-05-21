import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import { useToast } from './ToastContext';
import { getMockStockData, getStockBySymbol } from '../data/mockStocks';
import api from '../services/api';

const STOCK_API = 'http://localhost:5005/api/stocks';

const MarketContext = createContext(null);

export const MarketProvider = ({ children }) => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const { isDarkMode } = useTheme();
    const [isRealMode, setIsRealMode] = useState(() => {
        const savedMode = localStorage.getItem('tradingMode');
        return savedMode === 'REAL';
    });
    const currentMode = isRealMode ? 'REAL' : 'DEMO';

    const [realBalance, setRealBalance] = useState(0);
    const [demoBalance, setDemoBalance] = useState(0);
    const balance = isRealMode ? realBalance : demoBalance;

    const [holdings, setHoldings] = useState([]);
    const [orders, setOrders] = useState([]);
    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFundingModal, setShowFundingModal] = useState(false);
    const [showSettleModal, setShowSettleModal] = useState(false);

    // Fetch holdings & orders from backend, then enrich with mock prices
    const fetchData = useCallback(async () => {
        if (!user) return;
        try {
            const [holdingsData, ordersData, watchlistData, userData] = await Promise.all([
                api.get(`/trade/holdings?mode=${currentMode}`),
                api.get(`/trade/orders?mode=${currentMode}`),
                api.get(`/trade/watchlist?mode=${currentMode}`),
                api.get('/auth/me')
            ]);

            if (holdingsData.success) {
                // Fetch live prices from backend (cached Alpha Vantage)
                let priceMap = {};
                try {
                    const stockRes = await fetch(STOCK_API);
                    const stockJson = await stockRes.json();
                    if (stockJson.success) {
                        stockJson.data.forEach(s => { priceMap[s.symbol] = s.price; });
                    }
                } catch {
                    // Fallback to mock prices
                    const allMockPrices = getMockStockData();
                    allMockPrices.forEach(s => { priceMap[s.symbol] = s.price; });
                }

                const mappedHoldings = holdingsData.data.map(h => {
                    const cleanTicker = h.ticker.split(':')[0].split('.')[0].toUpperCase();
                    const ltp = priceMap[cleanTicker] || h.avgPrice;
                    const pnl = (ltp - h.avgPrice) * h.qty;
                    const pnlPercent = h.avgPrice > 0
                        ? (((ltp - h.avgPrice) / h.avgPrice) * 100).toFixed(2)
                        : 0;
                    return {
                        ...h,
                        id: h._id,
                        name: h.stockName,
                        ltp,
                        pnl,
                        pnlPercent,
                    };
                });
                setHoldings(mappedHoldings);
            }

            if (ordersData.success) {
                setOrders(ordersData.data.map(o => ({
                    ...o,
                    id: o._id,
                    stock: o.stockName,
                    date: new Date(o.date).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                    }),
                })));
            }

            if (watchlistData.success) {
                setWatchlist(watchlistData.data);
            }

            if (userData.success) {
                setRealBalance(userData.data.realBalance || 0);
                setDemoBalance(userData.data.demoBalance || 0);
            }
        } catch (err) {
            console.error('Portfolio data fetch failed:', err);
        } finally {
            setLoading(false);
        }
    }, [user, currentMode]);

    useEffect(() => {
        if (user) {
            setLoading(true);
            setHoldings([]);
            setOrders([]);
            setWatchlist([]);

            setRealBalance(user.realBalance || 0);
            setDemoBalance(user.demoBalance || 0);
            fetchData();
            // Refresh full portfolio data every 30 seconds
            const interval = setInterval(fetchData, 30000);
            return () => clearInterval(interval);
        }
    }, [user, fetchData, currentMode]);

    // Live update holdings prices every 30s using backend API
    useEffect(() => {
        const priceInterval = setInterval(async () => {
            setHoldings(prev => {
                if (!prev || prev.length === 0) return prev;

                // Fetch from backend asynchronously
                (async () => {
                    let priceMap = {};
                    try {
                        const res = await fetch(STOCK_API);
                        const json = await res.json();
                        if (json.success) {
                            json.data.forEach(s => { priceMap[s.symbol] = s.price; });
                        }
                    } catch {
                        const allMockPrices = getMockStockData();
                        allMockPrices.forEach(s => { priceMap[s.symbol] = s.price; });
                    }

                    setHoldings(current => {
                        if (!current || current.length === 0) return current;
                        let changed = false;
                        const newHoldings = current.map(h => {
                            const cleanTicker = h.ticker.split(':')[0].split('.')[0].toUpperCase();
                            const ltp = priceMap[cleanTicker] || h.avgPrice;
                            if (ltp !== h.ltp) changed = true;
                            const pnl = (ltp - h.avgPrice) * h.qty;
                            const pnlPercent = h.avgPrice > 0
                                ? (((ltp - h.avgPrice) / h.avgPrice) * 100).toFixed(2)
                                : 0;
                            return { ...h, ltp, pnl, pnlPercent };
                        });
                        return changed ? newHoldings : current;
                    });
                })();

                return prev; // return prev immediately, async update will follow
            });
        }, 10000);
        return () => clearInterval(priceInterval);
    }, []);

    const buyStock = async (stock, qty) => {
        if (!stock || qty <= 0) return false;

        const currentPrice = stock.price || 0;
        const totalCost = currentPrice * qty;

        try {
            const res = await api.post('/trade/order', {
                stockName: stock.name,
                ticker: stock.ticker || stock.symbol,
                price: currentPrice,
                type: 'BUY',
                qty,
                mode: currentMode
            });
            if (res.success) {
                if (currentMode === 'REAL') setRealBalance(res.newBalance);
                else setDemoBalance(res.newBalance);
                showToast(`✅ Bought ${qty} share(s) of ${stock.ticker || stock.symbol} @ ₹${currentPrice.toLocaleString()}`, 'success');
                fetchData();
                return true;
            }
        } catch (err) {
            showToast(err.message || err || 'Trade failed', 'error');
            return false;
        }
    };

    const sellStock = async (holding, qty) => {
        if (!holding || qty <= 0) return false;

        const currentPrice = holding.ltp;

        try {
            const res = await api.post('/trade/order', {
                stockName: holding.name || holding.stockName,
                ticker: holding.ticker,
                price: currentPrice,
                type: 'SELL',
                qty,
                mode: currentMode
            });
            if (res.success) {
                if (currentMode === 'REAL') setRealBalance(res.newBalance);
                else setDemoBalance(res.newBalance);
                showToast(`✅ Sold ${qty} share(s) of ${holding.ticker} @ ₹${currentPrice.toLocaleString()}`, 'success');
                fetchData();
                return true;
            }
        } catch (err) {
            showToast(err.message || err || 'Sell failed', 'error');
            return false;
        }
    };

    const addToWatchlist = async (ticker, stockName) => {
        try {
            const res = await api.post('/trade/watchlist/add', { ticker, stockName, mode: currentMode });
            if (res.success) {
                setWatchlist(res.data);
                showToast(`✅ Added ${ticker} to watchlist`, 'success');
                return true;
            }
        } catch (err) {
            showToast(err.message || err || 'Failed to add to watchlist', 'error');
            return false;
        }
    };

    const removeFromWatchlist = async (ticker) => {
        try {
            const res = await api.delete(`/trade/watchlist/remove/${ticker}?mode=${currentMode}`);
            if (res.success) {
                setWatchlist(res.data);
                showToast(`✅ Removed ${ticker} from watchlist`, 'success');
                return true;
            }
        } catch (err) {
            showToast(err.message || err || 'Failed to remove from watchlist', 'error');
            return false;
        }
    };

    const watchlistStocks = watchlist.map(item => {
        const mockStock = getStockBySymbol(item.ticker);
        return {
            ...item,
            id: item._id,
            price: mockStock ? mockStock.basePrice : 0,
            change: mockStock ? 0.5 : 0 // Placeholder change
        };
    });

    const investedAmount = holdings.reduce((acc, h) => acc + h.qty * h.avgPrice, 0);
    const portfolioValue = holdings.reduce((acc, h) => acc + h.qty * h.ltp, 0);
    const totalPnL = portfolioValue - investedAmount;
    const totalPnLPercent = investedAmount > 0
        ? ((totalPnL / investedAmount) * 100).toFixed(2)
        : 0;

    const handleFundingSubmit = async (amount) => {
        if (!amount || isNaN(amount) || amount <= 0) return;

        setShowFundingModal(false);

        try {
            const orderRes = await api.post('/payment/razorpay/order', { amount });
            if (!orderRes.success) throw new Error(orderRes.message);

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: orderRes.order.amount,
                currency: "INR",
                name: "Investra Live",
                description: "Add Funds to Account",
                order_id: orderRes.order.id,
                handler: async (response) => {
                    const verifyRes = await api.post('/payment/razorpay/verify', {
                        ...response,
                        amount
                    });

                    if (verifyRes.success) {
                        showToast("✅ Balance updated successfully!", "success");
                        fetchData();
                    } else {
                        showToast("❌ Payment verification failed", "error");
                    }
                },
                prefill: { name: user?.name, email: user?.email },
                theme: { color: "#16a34a" }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            showToast("Payment failed to initialize", "error");
        }
    };
    const settleFunds = async (amount) => {
        if (!amount || isNaN(amount) || amount <= 0) {
            showToast("Please enter a valid amount", "error");
            return;
        }

        try {
            const res = await api.post('/payment/settle', { amount });
            if (res.success) {
                showToast("✅ Funds settled successfully to your account!", "success");
                setShowSettleModal(false);
                fetchData();
            } else {
                showToast(res.message || "Settlement failed", "error");
            }
        } catch (err) {
            showToast(err.message || err || "Settlement failed", "error");
        }
    };

    const toggleMode = () => {
        const newModeValue = !isRealMode;
        setIsRealMode(newModeValue);
        localStorage.setItem('tradingMode', newModeValue ? 'REAL' : 'DEMO');
        
        // Show informative toast
        showToast(`Switched to ${newModeValue ? 'REAL' : 'DEMO'} mode`, 'info');
    };

    return (
        <MarketContext.Provider value={{
            balance,
            holdings,
            orders,
            loading,
            portfolioValue,
            investedAmount,
            totalPnL,
            totalPnLPercent,
            buyStock,
            sellStock,
            currentMode,
            mode: currentMode,
            isRealMode,
            toggleMode,
            watchlist,
            watchlistStocks,
            addToWatchlist,
            removeFromWatchlist,
            fetchData,
            showFundingModal,
            setShowFundingModal,
            handleFundingSubmit,
            showSettleModal,
            setShowSettleModal,
            settleFunds
        }}>
            {children}
        </MarketContext.Provider>
    );
};

export const useMarket = () => useContext(MarketContext);
