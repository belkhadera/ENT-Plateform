require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');

const app = express();
connectDB();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ success: true, message: 'Admin Service running' }));

const PORT = process.env.PORT || 8009;
app.listen(PORT, () => console.log(`Admin Service on port ${PORT}`));

module.exports = app;
