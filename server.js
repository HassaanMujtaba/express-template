const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectDb } = require('./src/config/mongoOperations'); 
const { authRoutes } = require('./src/routes');

// Load environment variables
dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev' });

const app = express();
app.use(express.json());
app.use(cors());
app.use('/api/auth', authRoutes);

// Connect to the MongoDB
connectDb();

// Define colors for logs
const colors = {
  green: '\x1b[32m%s\x1b[0m', // Green text
  yellow: '\x1b[33m%s\x1b[0m', // Yellow text
  cyan: '\x1b[36m%s\x1b[0m',   // Cyan text
};

// Log the environment
const environment = process.env.NODE_ENV === 'production' ? 'Production' : 'Development';
console.log(colors.yellow, `Running in ${environment} mode`);

// Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(colors.cyan, `Server running on port ${PORT}`);
});
