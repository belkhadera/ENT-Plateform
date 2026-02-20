require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const courseRoutes = require('./routes/courseRoutes');

const app = express();
connectDB();

app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000', // Ton React
  credentials: true,
   methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use('/api/courses', courseRoutes);
app.get('/health', (req, res) => res.json({ success: true, message: 'Course Service running' }));

const PORT = process.env.PORT || 8003;
app.listen(PORT, () => console.log(`Course Service on port ${PORT}`));

module.exports = app;
