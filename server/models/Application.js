import mongoose from 'mongoose';
import { isFallbackMode } from '../config/db.js';
import { MockModel } from './MockModel.js';

const ApplicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  portfolio: { type: String, default: '' },
  github: { type: String, default: '' },
  coverLetter: { type: String, default: '' },
  resume: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Applied', 'Reviewed', 'Shortlisted', 'Interview', 'Rejected', 'Hired'], 
    default: 'Applied' 
  },
  notes: { type: String, default: '' },
  interviewDate: { type: Date },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const MongooseApplication = mongoose.model('Application', ApplicationSchema);
const MockApplication = new MockModel('applications');

export default {
  findOne: (query) => isFallbackMode ? MockApplication.findOne(query) : MongooseApplication.findOne(query),
  find: (query) => isFallbackMode ? MockApplication.find(query) : MongooseApplication.find(query),
  findById: (id) => isFallbackMode ? MockApplication.findById(id) : MongooseApplication.findById(id),
  create: (data) => isFallbackMode ? MockApplication.create(data) : MongooseApplication.create(data),
  findByIdAndUpdate: (id, update, options) => isFallbackMode ? MockApplication.findByIdAndUpdate(id, update, options) : MongooseApplication.findByIdAndUpdate(id, update, options),
  findByIdAndDelete: (id) => isFallbackMode ? MockApplication.findByIdAndDelete(id) : MongooseApplication.findByIdAndDelete(id),
  deleteOne: (query) => isFallbackMode ? MockApplication.deleteOne(query) : MongooseApplication.deleteOne(query),
  deleteMany: (query) => isFallbackMode ? MockApplication.deleteMany(query) : MongooseApplication.deleteMany(query),
  countDocuments: (query) => isFallbackMode ? MockApplication.countDocuments(query) : MongooseApplication.countDocuments(query)
};
