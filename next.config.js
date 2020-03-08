require('dotenv').config();

module.exports = {
  env: {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    SERVER_URL:
      process.env.NOW_URL || process.env.SERVER_URL || 'http://localhost:3000',
  },
};
