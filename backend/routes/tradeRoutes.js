const express = require('express');
const { placeOrder, getOrders, getHoldings, resetDemo } = require('../controllers/tradeController');
const { getWatchlist, addToWatchlist, removeFromWatchlist } = require('../controllers/watchlistController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // Protect all trade routes

router.post('/order', placeOrder);
router.get('/orders', getOrders);
router.get('/holdings', getHoldings);
router.post('/reset-demo', resetDemo);

// Watchlist routes
router.get('/watchlist', getWatchlist);
router.post('/watchlist/add', addToWatchlist);
router.delete('/watchlist/remove/:ticker', removeFromWatchlist);

module.exports = router;
