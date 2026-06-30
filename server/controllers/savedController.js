import mongoose from 'mongoose';
import SavedJob from '../models/SavedJob.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import * as dbAdapter from '../utils/dbAdapter.js';

export const saveJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    let job;
    if (mongoose.connection.readyState === 1) {
      job = await Job.findById(jobId);
    } else {
      job = dbAdapter.findOne('jobs', j => j._id.toString() === jobId.toString());
    }

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    let alreadySaved;
    if (mongoose.connection.readyState === 1) {
      alreadySaved = await SavedJob.findOne({ userId: req.user._id, jobId });
    } else {
      alreadySaved = dbAdapter.findOne('savedJobs', s => s.userId.toString() === req.user._id.toString() && s.jobId.toString() === jobId.toString());
    }

    if (alreadySaved) {
      return res.status(400).json({ success: false, message: 'Job already saved' });
    }

    let saved;
    if (mongoose.connection.readyState === 1) {
      saved = await SavedJob.create({
        userId: req.user._id,
        jobId
      });
    } else {
      saved = await dbAdapter.createItem('savedJobs', {
        userId: req.user._id,
        jobId
      });
    }

    res.status(201).json(saved);
  } catch (error) {
    console.error('Save Job Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getSavedJobs = async (req, res) => {
  try {
    const jobs = [];

    if (mongoose.connection.readyState === 1) {
      const saved = await SavedJob.find({ userId: req.user._id }).populate('jobId');
      for (let item of saved) {
        if (item.jobId) {
          let job = item.jobId;
          if (job.postedBy && typeof job.postedBy === 'string') {
            const postedByUser = await User.findById(job.postedBy);
            if (postedByUser) {
              const userCopy = { ...postedByUser };
              delete userCopy.password;
              job.postedBy = userCopy;
            }
          } else if (job.postedBy && job.postedBy._id && typeof job.postedBy.password !== 'undefined') {
            delete job.postedBy.password;
          }
          jobs.push(job);
        }
      }
    } else {
      const saved = dbAdapter.findItems('savedJobs', s => s.userId.toString() === req.user._id.toString());
      for (let item of saved) {
        if (item.jobId) {
          const job = dbAdapter.findOne('jobs', j => j._id.toString() === item.jobId.toString());
          if (job) {
            const jobCopy = { ...job };
            if (jobCopy.postedBy) {
              const postedByUser = dbAdapter.findOne('users', u => u._id.toString() === jobCopy.postedBy.toString());
              if (postedByUser) {
                const userCopy = { ...postedByUser };
                delete userCopy.password;
                jobCopy.postedBy = userCopy;
              }
            }
            jobs.push(jobCopy);
          }
        }
      }
    }
    
    res.json({
      success: true,
      savedJobs: jobs || []
    });
  } catch (error) {
    console.error('Get Saved Jobs Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const unsaveJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (mongoose.connection.readyState === 1) {
      await SavedJob.deleteOne({ userId: req.user._id, jobId });
    } else {
      const saved = dbAdapter.findOne('savedJobs', s => s.userId.toString() === req.user._id.toString() && s.jobId.toString() === jobId.toString());
      if (saved) {
        dbAdapter.deleteItem('savedJobs', saved._id);
      }
    }

    res.json({ message: 'Job removed from saved list' });
  } catch (error) {
    console.error('Unsave Job Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
