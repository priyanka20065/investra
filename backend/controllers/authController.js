const User = require('../models/User');
const Order = require('../models/Order');
const Holding = require('../models/Holding');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');


exports.register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Create user
        const user = await User.create({
            name,
            email,
            password
        });

        sendTokenResponse(user, 201, res);
    } catch (err) {
        next(err);
    }
};
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return next(new ErrorResponse('Please provide an email and password', 400));
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return next(new ErrorResponse('Invalid credentials', 401));
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return next(new ErrorResponse('Invalid credentials', 401));
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        next(err);
    }
};


// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        // Ensure balances exist for old accounts moving to new schema
        if (user.realBalance === undefined) user.realBalance = 0;
        if (user.demoBalance === undefined) user.demoBalance = 10000;
        if (user.isModified()) await user.save();

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('+password');

        // Check current password
        if (!(await user.matchPassword(req.body.currentPassword))) {
            return next(new ErrorResponse('Current password is incorrect', 400));
        }

        user.password = req.body.newPassword;
        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (err) {
        next(err);
    }
};

// @desc    Delete account
// @route   DELETE /api/auth/deleteaccount
// @access  Private
exports.deleteAccount = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Delete all related data
        await Promise.all([
            Order.deleteMany({ user: userId }),
            Holding.deleteMany({ user: userId }),
            User.findByIdAndDelete(userId)
        ]);

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get active sessions
// @route   GET /api/auth/sessions
// @access  Private
exports.getSessions = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('sessions');
        res.status(200).json({
            success: true,
            data: user.sessions
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Logout from a specific session
// @route   DELETE /api/auth/sessions/:sessionId
// @access  Private
exports.logoutSession = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        const { sessionId } = req.params;

        // Remove the session from DB
        user.sessions = user.sessions.filter(s => s.sessionId !== sessionId);
        await user.save();

        // Emit the force logout event through the global IO (will be set up in server.js)
        if (global.io) {
            global.io.to(`session_${sessionId}`).emit('forced_logout', { 
                message: 'Your session has been terminated from another device.' 
            });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Export user data (Deprecated for now)


// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
    try {
        const fieldsToUpdate = {
            name: req.body.name,
            email: req.body.email
        };

        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        next(err);
    }
};


// Get token from model, create cookie and send response
const sendTokenResponse = async (user, statusCode, res) => {
    // Generate unique session ID
    const sessionId = crypto.randomBytes(16).toString('hex');

    // Store session details
    // We can extract basic device info from user-agent header if we want, or just generic
    const newSession = {
        sessionId,
        lastActive: new Date(),
        // Simple IP extraction
        ip: res.req.ip || res.req.connection.remoteAddress
    };

    // Limit to 5 active sessions
    if (user.sessions.length >= 5) {
        user.sessions.shift();
    }
    user.sessions.push(newSession);
    await User.findByIdAndUpdate(user._id, { sessions: user.sessions });

    // Create token with sessionId embedded
    const token = jwt.sign({ id: user._id, sessionId }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });

    res.status(statusCode).json({
        success: true,
        token,
        sessionId, // Send it back to frontend for local tracking
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            realBalance: user.realBalance,
            demoBalance: user.demoBalance,
            createdAt: user.createdAt
        }
    });
};
