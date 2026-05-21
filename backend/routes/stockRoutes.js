const express = require('express');
const { getAllStocks, getSingleStock, getStats, getFinancialData } = require('../utils/stockService');
const { getStockNews } = require('../utils/newsService');

const router = express.Router();

/**
 * GET /api/stocks
 * Returns all 20 stocks with live or cached prices.
 * Query params:
 *   ?refresh=true — force a fresh fetch (burns API calls!)
 */
router.get('/', async (req, res) => {
    try {
        const forceRefresh = req.query.refresh === 'true';
        const result = await getAllStocks(forceRefresh);

        res.json({
            success: true,
            count: result.stocks.length,
            fromCache: result.fromCache,
            apiCallsUsed: result.apiCallsUsed,
            data: result.stocks,
        });
    } catch (err) {
        console.error('[StockRoutes] GET /api/stocks error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * GET /api/stocks/stats
 * Returns cache & API usage stats (for debugging).
 */
router.get('/stats', (req, res) => {
    res.json({ success: true, data: getStats() });
});

/**
 * GET /api/stocks/news/:symbol
 * Returns top 5 real news articles for a stock.
 */
router.get('/news/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        const news = await getStockNews(symbol);
        res.json({ success: true, data: news });
    } catch (err) {
        console.error(`[StockRoutes] GET /api/stocks/news/${req.params.symbol} error:`, err);
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * GET /api/stocks/:symbol
 * Returns a single stock quote by symbol (e.g., RELIANCE).
 */
router.get('/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        const result = await getSingleStock(symbol);

        if (!result.stock) {
            return res.status(404).json({ success: false, message: result.error || 'Stock not found' });
        }

        res.json({
            success: true,
            fromCache: result.fromCache,
            data: result.stock,
        });
    } catch (err) {
        console.error(`[StockRoutes] GET /api/stocks/${req.params.symbol} error:`, err);
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * GET /api/stocks/financials/:symbol
 * Returns the annual financials (revenue, earnings)
 */
router.get('/financials/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        const result = await getFinancialData(symbol);

        if (!result.data) {
            return res.status(404).json({ success: false, message: result.error || 'Financials not found' });
        }

        res.json({
            success: true,
            data: result.data,
        });
    } catch (err) {
        console.error(`[StockRoutes] GET /api/stocks/financials/${req.params.symbol} error:`, err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
