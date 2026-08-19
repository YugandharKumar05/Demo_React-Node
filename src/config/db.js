const mongoose = require('mongoose');

async function connectDB(retries = 5, delayMs = 3000) {
  const uri = process.env.MONGO_URI;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(uri);
      console.log('MongoDB connected');
      return;
    } catch (err) {
      if (attempt === retries) throw err;
      console.error(`MongoDB connection attempt ${attempt} failed: ${err.message}. Retrying in ${delayMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

module.exports = connectDB;
