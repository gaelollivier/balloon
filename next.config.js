require('dotenv').config();

module.exports = {
  env: {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    SERVER_URL:
      process.env.NOW_URL || process.env.SERVER_URL || 'http://localhost:3000'
  }
};
