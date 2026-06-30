import mongoose from 'mongoose';
import { isFallbackMode } from '../config/db.js';
import { MockModel } from './MockModel.js';

const SavedJobSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true }
});

const MongooseSavedJob = mongoose.model('SavedJob', SavedJobSchema);
const MockSavedJob = new MockModel('savedjobs');

export default {
  findOne: (query) => isFallbackMode ? MockSavedJob.findOne(query) : MongooseSavedJob.findOne(query),
  find: (query) => isFallbackMode ? MockSavedJob.find(query) : MongooseSavedJob.find(query),
  findById: (id) => isFallbackMode ? MockSavedJob.findById(id) : MongooseSavedJob.findById(id),
  create: (data) => isFallbackMode ? MockSavedJob.create(data) : MongooseSavedJob.create(data),
  findByIdAndUpdate: (id, update, options) => isFallbackMode ? MockSavedJob.findByIdAndUpdate(id, update, options) : MongooseSavedJob.findByIdAndUpdate(id, update, options),
  findByIdAndDelete: (id) => isFallbackMode ? MockSavedJob.findByIdAndDelete(id) : MongooseSavedJob.findByIdAndDelete(id),
  deleteOne: (query) => isFallbackMode ? MockSavedJob.deleteOne(query) : MongooseSavedJob.deleteOne(query),
  deleteMany: (query) => isFallbackMode ? MockSavedJob.deleteMany(query) : MongooseSavedJob.deleteMany(query),
  countDocuments: (query) => isFallbackMode ? MockSavedJob.countDocuments(query) : MongooseSavedJob.countDocuments(query)
};
