const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret'
});

exports.createOrder = async (req, res) => {
    try {
        const { amount } = req.body; // Amount in INR

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid amount' });
        }

        const options = {
            amount: Math.round(amount * 100), // Amount in paise (must be integer)
            currency: 'INR',
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        res.status(200).json({ success: true, order });
    } catch (err) {
        console.error('Razorpay Order Creation Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

        const body = razorpay_order_id + '|' + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            // Payment verified
            const user = await User.findById(req.user._id);

            // ONLY add balance if skipBalanceUpdate is NOT true (e.g. for "Add Funds")
            // For direct stock buys, we skip this because the user is paying for the stock directly.
            const { skipBalanceUpdate } = req.body;
            if (!skipBalanceUpdate) {
                user.realBalance += Number(amount);
                await user.save();
            }

            res.status(200).json({
                success: true,
                message: skipBalanceUpdate ? 'Payment verified successfully.' : 'Payment verified successfully. Balance updated.',
                newBalance: user.realBalance
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.settleFunds = async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid amount' });
        }

        const user = await User.findById(req.user._id);

        if (user.realBalance < amount) {
            return res.status(400).json({ success: false, message: 'Insufficient real balance' });
        }

        // Deduct amount from real balance (No fee for settlement)
        const platformFee = 0;
        const netAmount = Number(amount);

        user.realBalance -= Number(amount);
        await user.save();

        // Record as a WITHDRAWAL order for history
        const Order = require('../models/Order');
        await Order.create({
            user: user._id,
            stockName: 'Wallet Settlement',
            ticker: 'SETTLE',
            type: 'WITHDRAWAL',
            mode: 'REAL',
            qty: 1,
            price: Number(amount),
            totalAmount: Number(amount),
            fee: platformFee,
            status: 'COMPLETED'
        });

        res.status(200).json({
            success: true,
            message: `Funds settled successfully. Amount ₹${netAmount.toLocaleString()} will be credited.`,
            newBalance: user.realBalance
        });
    } catch (err) {
        console.error('Settlement Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};
