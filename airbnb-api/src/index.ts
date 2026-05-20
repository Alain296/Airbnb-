import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import compression from "compression";
import morgan from "morgan";
import cors, { CorsOptions } from "cors";
import { execFile } from "child_process";
import { promisify } from "util";
import { connectDB } from "./config/prisma";
import { setupSwagger } from "./config/swagger";
import { validateAIConfig } from "./config/ai";
import { generalLimiter } from "./middlewares/rateLimiter";
import { deprecateV1 } from "./middlewares/deprecation.middleware";
import v1Router from "./routes/v1/index";

const app = express();
const PORT = Number(process.env["PORT"]) || 3000;
const execFileAsync = promisify(execFile);

const splitOrigins = (value?: string) =>
  value
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];

const configuredCorsOrigins = [
  process.env["FRONTEND_URL"],
  process.env["BASE_URL"],
  process.env["API_URL"],
  ...splitOrigins(process.env["CORS_ORIGINS"]),
  ...splitOrigins(process.env["ALLOWED_ORIGINS"]),
]
  .map((origin) => origin?.trim().replace(/\/+$/, ""))
  .filter((origin): origin is string => Boolean(origin));

const allowedOrigins = new Set([
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5175',
  'https://airbnb-api-woxo.onrender.com',
  'https://airbnb-pi-rust.vercel.app',
  ...configuredCorsOrigins,
]);

const isAllowedVercelOrigin = (origin: string) =>
  /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin);

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin) || isAllowedVercelOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Request logging (use 'combined' format in production, 'dev' in development)
app.use(process.env["NODE_ENV"] === "production" ? morgan("combined") : morgan("dev"));

// CORS configuration for the frontend, Swagger UI, and Vercel deployments.
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// Performance middleware (order matters!)
app.use(compression()); // Enable gzip compression
app.use(express.json({ limit: '10mb' })); // Parse JSON with size limit
app.use(express.urlencoded({ extended: true })); // Parse OAuth form_post callbacks

// Apply rate limiting to all routes
app.use(generalLimiter);

// Setup Swagger documentation
setupSwagger(app);

// Tolerate clients configured with API_URL values that already include /api/v1.
app.use((req: Request, _res: Response, next: NextFunction) => {
  req.url = req.url.replace(/^\/api\/v1(?:\/api\/v1)+/i, "/api/v1");
  next();
});

// Health check endpoint (before versioned routes)
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: "1.0.0"
  });
});

// Root endpoint - redirect to API docs
app.get("/", (req: Request, res: Response) => {
  res.redirect("/api-docs");
});

// API v1 routes with deprecation headers
app.use("/api/v1", deprecateV1, v1Router);

// 404 handler - must come after all routes
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    error: "Route not found",
    path: req.path,
    method: req.method
  });
});

// Global error handler - must be last
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("💥 Global error:", err.stack);
  res.status(500).json({ 
    error: "Something went wrong",
    message: process.env["NODE_ENV"] === "development" ? err.message : undefined
  });
});

const runMigrations = async (): Promise<void> => {
  if (process.env["NODE_ENV"] !== "production" || process.env["SKIP_MIGRATIONS"] === "true") {
    return;
  }

  const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";
  console.log("Running database migrations before startup...");
  const { stdout, stderr } = await execFileAsync(npxCommand, ["prisma", "migrate", "deploy"]);
  if (stdout) console.log(stdout);
  if (stderr) console.error(stderr);
};

const main = async (): Promise<void> => {
  try {
    await runMigrations();
    await connectDB();
    validateAIConfig(); // Initialize AI configuration
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`❤️ Health Check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
