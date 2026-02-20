require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const chatbotRoutes = require('./routes/chatbotRoutes');

const app = express();
connectDB();

app.use(helmet());
// Dans backend/api-gateway/app.js

app.use(cors({
  origin: 'http://localhost:3000', // Ton React
  credentials: true,
  // AJOUTE 'PATCH' ICI 👇
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use('/api/chatbot', chatbotRoutes);
app.get('/health', (req, res) => res.json({ success: true, message: 'Exam Service running' }));

const PORT = process.env.PORT || 8008;
app.listen(PORT, () => console.log(`Exam Service on port ${PORT}`));

module.exports = app;
