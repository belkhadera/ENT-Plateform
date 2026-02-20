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

app.get('/health', (req, res) => res.json({ success: true, message: 'Calendar Service running' }));

const PORT = process.env.PORT || 8006;
app.listen(PORT, () => console.log(`Calendar Service on port ${PORT}`));

module.exports = app;
