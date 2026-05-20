import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// ✅ Resolve backend root and load .env reliably (ESM safe)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env is one level above src → backend/.env
const envPath = path.resolve(__dirname, '../.env');

console.log('ENV PATH:', envPath);
console.log('ENV EXISTS:', fs.existsSync(envPath));


import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
// import { specs, swaggerUi } from './config/swagger.js';
import { swaggerDocs } from './config/swagger.js';
import errorHandler from './middlewares/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import resumeRoutes from './routes/resume.routes.js';
import aiRoutes from './routes/ai.routes.js';

const app = express();

// ✅ Ensure uploads folder exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// 🔐 Security headers
app.use(helmet());

// 🌐 CORS config
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : 'http://localhost:5173',
  credentials: true,
}));

// 🚦 Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// 📦 Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🛡️ Prevent MongoDB operator injection
app.use(mongoSanitize());

// 📚 Swagger docs
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
swaggerDocs(app);

// 🏠 Health route
app.get('/', (req, res) => {
  res.json({
    message: 'ATS Resume Analyzer API',
    version: '1.0.0',
    docs: '/api-docs',
  });
});

// 🔑 Routes
app.use('/api', authRoutes);
app.use('/api', resumeRoutes);
app.use('/api', aiRoutes);

// ❗ Global error handler
app.use(errorHandler);

export default app;