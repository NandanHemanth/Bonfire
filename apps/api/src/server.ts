import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import logger from './middleware/logger.js';
import errorHandler from './middleware/errorHandler.js';
import repoRoutes from './routes/repos.js';
import dataRoutes from './routes/data.js';
import mcpRoutes from './routes/mcp.js';
import workflowRoutes from './routes/workflows.js';

// Load environment variables from root directory
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root (two levels up from src/)
dotenv.config({ path: join(__dirname, '../../../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.WEB_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging middleware
app.use(logger);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/repos', repoRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/mcp', mcpRoutes);
app.use('/api', workflowRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🔥 BonFire API server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: ${process.env.WEB_URL || 'http://localhost:3000'}`);
  console.log(`🤖 Gemini API Key: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
});

export default app;

