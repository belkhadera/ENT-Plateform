const axios = require('axios');

exports.protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token' });
  
  try {
    const response = await axios.get(`http://localhost:8001/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    req.user = response.data.data.user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};
