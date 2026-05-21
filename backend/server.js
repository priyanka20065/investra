const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const { startAutoUpdate } = require("./utils/stockService");

dotenv.config();

const app = express();
const server = http.createServer(app);

/* -------------------- ALLOWED ORIGINS -------------------- */

const allowedOrigins = [
    "https://investra-dxlc.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173"
];

/* -------------------- CORS (EXPRESS) -------------------- */

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

/* -------------------- FIX PRE-FLIGHT -------------------- */
// IMPORTANT: avoids Express "*" crash
app.options("/*", cors());

/* -------------------- MIDDLEWARE -------------------- */

app.use(express.json());

/* -------------------- SOCKET.IO -------------------- */

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true
    }
});

global.io = io;

/* -------------------- SOCKET AUTH -------------------- */

io.use((socket, next) => {
    const token =
        socket.handshake.auth.token ||
        socket.handshake.query.token;

    if (!token) return next(new Error("Authentication error"));

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        socket.sessionId = decoded.sessionId;
        next();
    } catch (err) {
        next(new Error("Authentication error"));
    }
});

/* -------------------- SOCKET CONNECTION -------------------- */

io.on("connection", (socket) => {
    if (socket.userId && socket.sessionId) {
        socket.join(`user_${socket.userId}`);
        socket.join(`session_${socket.sessionId}`);

        console.log(`[Socket] Connected User ${socket.userId}`);
    }
});

/* -------------------- ROUTES -------------------- */

app.use("/api/stocks", require("./routes/stockRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/trade", require("./routes/tradeRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));

/* -------------------- HEALTH CHECK -------------------- */

app.get("/", (req, res) => {
    res.send("Backend is running 🚀");
});

/* -------------------- ERROR HANDLER -------------------- */

app.use(require("./middleware/error"));

/* -------------------- START SERVER -------------------- */

const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGODB_URI || process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB");

        startAutoUpdate(io);

        server.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
    });
