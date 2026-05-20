import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// ✅ Resolve backend root (ESM safe)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env is in backend root
const envPath = path.resolve(__dirname, '.env');

console.log('ENV PATH:', envPath);
console.log('ENV EXISTS:', fs.existsSync(envPath));

// ✅ Load environment variables BEFORE importing app
dotenv.config({ path: envPath });

import app from './src/app.js';
import connectDB from './src/config/db.js';

const PORT = process.env.PORT || 5000;

// ✅ Connect to MongoDB
connectDB();

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
});

// ✅ Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});