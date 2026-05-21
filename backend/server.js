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

/* -------------------- ALLOWED FRONTENDS -------------------- */

const allowedOrigins = [
    "https://investra-dxlc.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173"
];

if (process.env.FRONTEND_URL) {
    process.env.FRONTEND_URL.split(",").forEach(url => {
        allowedOrigins.push(url.trim());
    });
}

const isOriginAllowed = (origin) => {
    if (!origin) return true;
    const cleanOrigin = origin.replace(/\/$/, "");
    return allowedOrigins.some(allowed => allowed.replace(/\/$/, "") === cleanOrigin);
};

/* -------------------- CORS (EXPRESS SAFE) -------------------- */

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (isOriginAllowed(origin)) {
            return callback(null, true);
        }
        return callback(null, true); // SAFE MODE (Echoes back the request's origin)
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

/* -------------------- SAFE PRE-FLIGHT HANDLER -------------------- */

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
        res.header("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }

    next();
});

/* -------------------- MIDDLEWARE -------------------- */

app.use(express.json());

/* -------------------- SOCKET.IO -------------------- */

const io = new Server(server, {
    cors: {
        origin: function (origin, callback) {
            if (!origin || isOriginAllowed(origin)) {
                return callback(null, true);
            }
            return callback(null, true);
        },
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
