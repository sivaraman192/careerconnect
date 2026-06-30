import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { isFallbackMode } from '../config/db.js';
import { MockModel } from './MockModel.js';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['jobseeker', 'recruiter', 'admin'], default: 'jobseeker' },
  verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  companyName: { type: String, default: '' },
  companyWebsite: { type: String, default: '' },
  companySize: { type: String, default: '' },
  industry: { type: String, default: '' },
  companyLocation: { type: String, default: '' },
  designation: { type: String, default: '' },
  companyLogo: { type: String, default: '' },
  phone: { type: String, default: '' },
  skills: { type: [String], default: [] },
  experience: { type: String, default: '' },
  portfolio: { type: String, default: '' },
  github: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  resume: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

// Hash password for Mongoose
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const MongooseUser = mongoose.model('User', UserSchema);
const MockUser = new MockModel('users');

export default {
  findOne: (query) => isFallbackMode ? MockUser.findOne(query) : MongooseUser.findOne(query),
  find: (query) => isFallbackMode ? MockUser.find(query) : MongooseUser.find(query),
  findById: (id) => isFallbackMode ? MockUser.findById(id) : MongooseUser.findById(id),
  create: async (data) => {
    if (isFallbackMode) {
      if (data.password) {
        const salt = await bcrypt.genSalt(10);
        data.password = await bcrypt.hash(data.password, salt);
      }
      return MockUser.create(data);
    }
    return MongooseUser.create(data);
  },
  findByIdAndUpdate: (id, update, options) => isFallbackMode ? MockUser.findByIdAndUpdate(id, update, options) : MongooseUser.findByIdAndUpdate(id, update, options),
  findByIdAndDelete: (id) => isFallbackMode ? MockUser.findByIdAndDelete(id) : MongooseUser.findByIdAndDelete(id),
  deleteOne: (query) => isFallbackMode ? MockUser.deleteOne(query) : MongooseUser.deleteOne(query),
  deleteMany: (query) => isFallbackMode ? MockUser.deleteMany(query) : MongooseUser.deleteMany(query),
  countDocuments: (query) => isFallbackMode ? MockUser.countDocuments(query) : MongooseUser.countDocuments(query)
};
