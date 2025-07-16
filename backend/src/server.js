// backend/server.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('../app'); // import app từ app.js

dotenv.config();

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error connecting to the database', error);
  }
})();
