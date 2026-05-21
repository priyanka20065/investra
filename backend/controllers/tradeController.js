const Order = require('../models/Order');
const Holding = require('../models/Holding');
const User = require('../models/User');


exports.placeOrder = async (req, res) => {
    try {
        const { stockName, ticker, type, qty, price, mode, status = 'COMPLETED' } = req.body;
        // Validation
        if (!stockName || !ticker || !type || !qty || price === undefined || !mode) {
            return res.status(400).json({ success: false, message: 'Please provide stockName, ticker, type, qty, price and mode' });
        }

        const totalAmount = Number(qty) * Number(price);

        // If status is FAILED or CANCELLED, just record the order and return
        if (status === 'FAILED' || status === 'CANCELLED') {
            const failedOrder = await Order.create({
                user: req.user._id,
                stockName,
                ticker: ticker.toUpperCase(),
                type,
                mode,
                qty: Number(qty),
                price,
                totalAmount,
                status
            });
            return res.status(201).json({ success: true, data: failedOrder });
        }

        if (Number(price) <= 0) {
            return res.status(400).json({ success: false, message: 'Price must be positive' });
        }
        if (!['BUY', 'SELL'].includes(type)) {
            return res.status(400).json({ success: false, message: 'Invalid order type' });
        }

        // Re-fetch user balance from DB to get fresh value
        const freshUser = await User.findById(req.user._id);
        const balanceField = mode === 'REAL' ? 'realBalance' : 'demoBalance';

        // Check balance for both DEMO and REAL modes
        if (type === 'BUY' && freshUser[balanceField] < totalAmount) {
            await Order.create({
                user: req.user._id,
                stockName,
                ticker: ticker.toUpperCase(),
                type,
                mode,
                qty: Number(qty),
                price,
                totalAmount,
                status: 'CANCELLED'
            });
            return res.status(400).json({
                success: false,
                message: `Insufficient ${mode} balance. Need ₹${totalAmount.toFixed(2)} but have ₹${freshUser[balanceField].toFixed(2)}`
            });
        }

        const modeQuery = mode === 'REAL' ? 'REAL' : { $in: ['DEMO', null, undefined] };

        if (type === 'SELL') {
            const holding = await Holding.findOne({ user: req.user._id, ticker: ticker.toUpperCase(), mode: modeQuery });
            if (!holding || holding.qty < Number(qty)) {
                await Order.create({
                    user: req.user._id,
                    stockName,
                    ticker: ticker.toUpperCase(),
                    type,
                    mode,
                    qty: Number(qty),
                    price,
                    totalAmount,
                    status: 'CANCELLED'
                });
                return res.status(400).json({ success: false, message: 'Insufficient holdings to sell' });
            }
        }

        // Compute fee for SELL orders
        let fee = 0;
        if (type === 'SELL') {
            fee = totalAmount * 0.02;
        }

        // Create order record
        const order = await Order.create({
            user: req.user._id,
            stockName,
            ticker: ticker.toUpperCase(),
            type,
            mode,
            qty: Number(qty),
            price,
            totalAmount,
            fee,
            status: 'COMPLETED'
        });

        // Update balance
        if (type === 'BUY') {
            if (mode === 'REAL') freshUser.realBalance -= totalAmount;
            else freshUser.demoBalance -= totalAmount;
        } else {
            if (mode === 'REAL') freshUser.realBalance += (totalAmount - fee);
            else freshUser.demoBalance += (totalAmount - fee);
        }
        freshUser.markModified('realBalance');
        freshUser.markModified('demoBalance');
        await freshUser.save();

        // Update holdings
        const cleanTicker = ticker.toUpperCase();
        let holding = await Holding.findOne({ user: req.user._id, ticker: cleanTicker, mode: modeQuery });

        if (type === 'BUY') {
            if (holding) {
                const totalCost = (holding.qty * holding.avgPrice) + totalAmount;
                holding.qty += Number(qty);
                holding.avgPrice = totalCost / holding.qty;
                await holding.save();
            } else {
                await Holding.create({
                    user: req.user._id,
                    stockName,
                    ticker: cleanTicker,
                    qty: Number(qty),
                    avgPrice: price,
                    mode
                });
            }
        } else {
            if (holding) {
                holding.qty -= Number(qty);
                if (holding.qty <= 0) {
                    await Holding.deleteOne({ _id: holding._id });
                } else {
                    await holding.save();
                }
            }
        }

        res.status(201).json({
            success: true,
            data: order,
            newBalance: freshUser[balanceField]
        });
    } catch (err) {
        console.error('placeOrder error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};


exports.getOrders = async (req, res) => {
    try {
        const { mode } = req.query;
        const query = { user: req.user._id };
        if (mode === 'REAL') {
            query.mode = 'REAL';
        } else {
            // Default to DEMO or records without a mode
            query.mode = { $in: ['DEMO', null, undefined] };
        }

        const orders = await Order.find(query).sort('-date');
        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


exports.getHoldings = async (req, res) => {
    try {
        const { mode } = req.query;
        const query = { user: req.user._id };

        if (mode === 'REAL') {
            query.mode = 'REAL';
        } else {
            // Default to DEMO or records without a mode
            query.mode = { $in: ['DEMO', null, undefined] };
        }

        const holdings = await Holding.find(query);
        res.status(200).json({ success: true, count: holdings.length, data: holdings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


exports.resetDemo = async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. Reset Demo Balance in User Model
        const user = await User.findById(userId);
        user.demoBalance = 10000;
        user.demoWatchlist = []; // Clear demo watchlist too
        await user.save();

        // 2. Clear Demo Holdings
        await Holding.deleteMany({
            user: userId,
            mode: { $in: ['DEMO', null, undefined] }
        });

        // 3. Clear Demo Orders
        await Order.deleteMany({
            user: userId,
            mode: { $in: ['DEMO', null, undefined] }
        });

        res.status(200).json({
            success: true,
            message: 'Demo account reset successfully!',
            newBalance: 10000
        });
    } catch (err) {
        console.error('resetDemo error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};
