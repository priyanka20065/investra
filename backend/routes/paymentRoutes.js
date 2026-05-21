const express = require('express');
const { createOrder, verifyPayment, settleFunds } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/razorpay/order', createOrder);
router.post('/razorpay/verify', verifyPayment);
router.post('/settle', settleFunds);

module.exports = router;
