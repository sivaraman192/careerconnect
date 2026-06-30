import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

export let isFallbackMode = false;

export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not defined.');
    }
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    
    console.log("MongoDB connected successfully");
    console.log(`Database name: ${conn.connection.name || 'careerconnect'}`);
    isFallbackMode = false;
  } catch (error) {
    console.log("JSON fallback active");
    isFallbackMode = true;
    
    try {
      const { seedMockData } = await import('../utils/dbAdapter.js');
      await seedMockData();
    } catch (seedError) {
      // suppress seeding errors
    }
  }
};
