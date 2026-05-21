const User = require('../models/User');

// @desc    Get user watchlist
// @route   GET /api/trade/watchlist
// @access  Private
exports.getWatchlist = async (req, res) => {
    try {
        const { mode } = req.query;
        const watchlistField = mode === 'REAL' ? 'realWatchlist' : 'demoWatchlist';
        const user = await User.findById(req.user._id).select(watchlistField);
        res.status(200).json({ success: true, data: user[watchlistField] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Add stock to watchlist
// @route   POST /api/trade/watchlist/add
// @access  Private
exports.addToWatchlist = async (req, res) => {
    try {
        const { ticker, stockName, mode } = req.body;
        const watchlistField = mode === 'REAL' ? 'realWatchlist' : 'demoWatchlist';

        if (!ticker || !stockName || !mode) {
            return res.status(400).json({ success: false, message: 'Please provide ticker, stockName and mode' });
        }

        const user = await User.findById(req.user._id);

        // Check if already in watchlist
        const alreadyExists = user[watchlistField].find(item => item.ticker === ticker.toUpperCase());
        if (alreadyExists) {
            return res.status(400).json({ success: false, message: 'Stock already in watchlist' });
        }

        user[watchlistField].push({ ticker: ticker.toUpperCase(), stockName });
        await user.save();

        res.status(200).json({ success: true, data: user[watchlistField] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Remove stock from watchlist
// @route   DELETE /api/trade/watchlist/remove/:ticker
// @access  Private
exports.removeFromWatchlist = async (req, res) => {
    try {
        const { mode } = req.query; // pass mode in query for DELETE
        const watchlistField = mode === 'REAL' ? 'realWatchlist' : 'demoWatchlist';

        if (!mode) {
            return res.status(400).json({ success: false, message: 'Please provide mode' });
        }

        const user = await User.findById(req.user._id);

        user[watchlistField] = user[watchlistField].filter(item => item.ticker !== req.params.ticker.toUpperCase());
        await user.save();

        res.status(200).json({ success: true, data: user[watchlistField] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
