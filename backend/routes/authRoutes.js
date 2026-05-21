const express = require('express');
const { register, login, getMe, updatePassword, deleteAccount, getSessions, logoutSession, updateDetails } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', register);
router.post('/login', login);

router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.delete('/deleteaccount', protect, deleteAccount);

router.get('/sessions', protect, getSessions);
router.delete('/sessions/:sessionId', protect, logoutSession);

module.exports = router;
