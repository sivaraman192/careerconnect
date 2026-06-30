import mongoose from 'mongoose';
import { isFallbackMode } from '../config/db.js';
import { MockModel } from './MockModel.js';

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  salary: { type: String, required: true },
  jobType: { type: String, required: true },
  experience: { type: String, required: true },
  skills: { type: [String], default: [] },
  description: { type: String, default: '' },
  responsibilities: { type: [String], default: [] },
  requirements: { type: [String], default: [] },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const MongooseJob = mongoose.model('Job', JobSchema);
const MockJob = new MockModel('jobs');

export default {
  findOne: (query) => isFallbackMode ? MockJob.findOne(query) : MongooseJob.findOne(query),
  find: (query) => isFallbackMode ? MockJob.find(query) : MongooseJob.find(query),
  findById: (id) => isFallbackMode ? MockJob.findById(id) : MongooseJob.findById(id),
  create: (data) => isFallbackMode ? MockJob.create(data) : MongooseJob.create(data),
  findByIdAndUpdate: (id, update, options) => isFallbackMode ? MockJob.findByIdAndUpdate(id, update, options) : MongooseJob.findByIdAndUpdate(id, update, options),
  findByIdAndDelete: (id) => isFallbackMode ? MockJob.findByIdAndDelete(id) : MongooseJob.findByIdAndDelete(id),
  deleteOne: (query) => isFallbackMode ? MockJob.deleteOne(query) : MongooseJob.deleteOne(query),
  deleteMany: (query) => isFallbackMode ? MockJob.deleteMany(query) : MongooseJob.deleteMany(query),
  countDocuments: (query) => isFallbackMode ? MockJob.countDocuments(query) : MongooseJob.countDocuments(query)
};
