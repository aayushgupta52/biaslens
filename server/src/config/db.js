import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skew';
  try {
    await mongoose.connect(uri);
    console.log(`🍃 MongoDB connected → ${mongoose.connection.name}`);
  } catch (err) {
    console.error('✗ MongoDB connection failed:', err.message);
    process.exit(1);
  }
}
