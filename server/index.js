import express from "express";
import http from "node:http";
import { Server } from "socket.io";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

import reviewsRouter from "./routes/reviews.js";
import { countReviews } from "./db/reviewsDao.js";

// Load environment variables from .env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT || "5000", 10);
const CLIENT_URL = process.env.CLIENT_URL || "*";

// Socket.IO configuration with CORS
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL === "*" ? true : [CLIENT_URL, "http://localhost:5173", "http://localhost:8443"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Attach Socket.IO to Express app for use in route handlers
app.set("io", io);

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    console.log(`[HTTP ${req.method}] ${req.path}`);
  }
  next();
});

// API Routes
app.use("/api/reviews", reviewsRouter);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Sai Sarathi Travels Reviews API",
    totalReviews: countReviews(),
    timestamp: new Date().toISOString(),
  });
});

// Serve frontend build from dist if it exists (for full-stack production hosting)
const distPath = path.resolve(__dirname, "../dist");
if (fs.existsSync(distPath)) {
  console.log(`[Server] Serving production static files from: ${distPath}`);
  app.use(express.static(distPath));

  // SPA fallback for client-side routing (Express 5 compatible)
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api") || req.path.startsWith("/socket.io")) {
      return next();
    }
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  socket.on("disconnect", (reason) => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id} (${reason})`);
  });
});

// Start the server
server.listen(PORT, "0.0.0.0", () => {
  console.log(`=======================================================`);
  console.log(` Sai Sarathi Travels Backend & Real-time Server Running `);
  console.log(` Port: ${PORT}`);
  console.log(` Health: http://localhost:${PORT}/api/health`);
  console.log(` Reviews API: http://localhost:${PORT}/api/reviews`);
  console.log(` Socket.IO WebSocket: active on port ${PORT}`);
  console.log(`=======================================================`);
});

export { app, server, io };
