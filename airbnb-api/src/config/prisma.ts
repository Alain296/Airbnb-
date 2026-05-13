import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const databaseUrl = process.env["DATABASE_URL"];

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

// Create connection pool for better performance
const pool = new Pool({
  connectionString: databaseUrl,
  max: 10, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Return error after 2 seconds if connection cannot be established
});

// Handle pool events for monitoring
pool.on('connect', () => {
  console.log('🔗 New database connection established');
});

pool.on('error', (err) => {
  console.error('💥 Database pool error:', err);
});

// Create Prisma adapter with connection pool
const adapter = new PrismaPg(pool);

// Create Prisma client with optimized settings
const prisma = new PrismaClient({ 
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

export const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log("Connected to PostgreSQL with Prisma");
    console.log(`📊 Connection pool: max=${pool.options.max}, idle timeout=${pool.options.idleTimeoutMillis}ms`);
  } catch (error) {
    console.error("Failed to connect to database:", error);
    throw error;
  }
};

// Graceful shutdown
export const disconnectDB = async (): Promise<void> => {
  await prisma.$disconnect();
  await pool.end();
  console.log("Disconnected from PostgreSQL");
};

export default prisma;
