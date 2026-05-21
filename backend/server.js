const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const { startAutoUpdate } = require('./utils/stockService');

dotenv.config();

const jwt = require('jsonwebtoken');
const app = express();
const server = http.createServer(app);

// Socket.io initialization
const io = new Server(server, {
    cors: {
        origin: (origin, callback) => {
            if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
                callback(null, true);
            } else if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true
    }
});

// Make io accessible globally for controllers
global.io = io;

// Socket.io Auth Middleware
io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) return next(new Error('Authentication error'));

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        socket.sessionId = decoded.sessionId;
        next();
    } catch (err) {
        next(new Error('Authentication error'));
    }
});

io.on('connection', (socket) => {
    if (socket.userId && socket.sessionId) {
        // Join specific rooms for targeted events
        socket.join(`user_${socket.userId}`);
        socket.join(`session_${socket.sessionId}`);
        console.log(`[Socket] Active: User ${socket.userId} | Session ${socket.sessionId}`);
    }
});

// Middleware
app.use(express.json());
app.use(cors({
    origin: (origin, callback) => {
        // Allow all localhost origins in development
        if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
            callback(null, true);
        } else if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
app.use('/api/stocks', require('./routes/stockRoutes')); // Public — no auth
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/trade', require('./routes/tradeRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));

// Error Handler
app.use(require('./middleware/error'));

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        
        // Start Socket.io auto-updates
        startAutoUpdate(io);

        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });
