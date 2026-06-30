import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from './models/User.js';
import { connectDB } from './config/db.js';
import * as dbAdapter from './utils/dbAdapter.js';

const seed = async () => {
  try {
    await connectDB();

    const email = 'admin@careerconnect.com';
    const password = 'Admin@123';
    const name = 'Platform Admin';
    const role = 'admin';

    let existingAdmin;
    if (mongoose.connection.readyState === 1) {
      existingAdmin = await mongoose.model('User').findOne({ email });
    } else {
      existingAdmin = dbAdapter.findOne('users', u => u.email === email);
    }

    if (existingAdmin) {
      console.log('Admin user already exists.');
      process.exit(0);
    }

    let adminUser;
    if (mongoose.connection.readyState === 1) {
      adminUser = await User.create({
        name,
        email,
        password,
        role,
        verificationStatus: 'approved'
      });
    } else {
      adminUser = await User.create({
        name,
        email,
        password,
        role,
        verificationStatus: 'approved'
      });
    }

    console.log('Admin user created successfully.');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seed();
