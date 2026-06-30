import mongoose from 'mongoose';
import Job from '../models/Job.js';
import User from '../models/User.js';
import Application from '../models/Application.js';
import SavedJob from '../models/SavedJob.js';
import * as dbAdapter from '../utils/dbAdapter.js';

export const getStats = async (req, res) => {
  try {
    const isSeeker = req.user.role === 'jobseeker';
    const isRecruiter = req.user.role === 'recruiter';
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && !isRecruiter && !isSeeker) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (isSeeker) {
      let totalApplications = 0;
      let savedJobs = 0;
      let interviews = 0;

      if (mongoose.connection.readyState === 1) {
        totalApplications = await Application.countDocuments({ userId: req.user._id });
        savedJobs = await SavedJob.countDocuments({ userId: req.user._id });
        const apps = await Application.find({ userId: req.user._id });
        interviews = apps.filter(app => ['Shortlisted', 'Interview', 'Hired'].includes(app.status)).length;
      } else {
        totalApplications = dbAdapter.findItems('applications', a => a.userId.toString() === req.user._id.toString()).length;
        savedJobs = dbAdapter.findItems('savedJobs', s => s.userId.toString() === req.user._id.toString()).length;
        const apps = dbAdapter.findItems('applications', a => a.userId.toString() === req.user._id.toString());
        interviews = apps.filter(app => ['Shortlisted', 'Interview', 'Hired'].includes(app.status)).length;
      }

      return res.json({
        success: true,
        stats: {
          totalApplications,
          savedJobs,
          interviews,
          profileViews: 0
        }
      });
    }

    if (isRecruiter) {
      let totalJobs = 0;
      let totalApplications = 0;
      let shortlisted = 0;
      let hired = 0;
      let chartData = [];
      let recentJobs = [];

      const statusCounts = {
        Applied: 0,
        Reviewed: 0,
        Shortlisted: 0,
        Interview: 0,
        Rejected: 0,
        Hired: 0
      };

      if (mongoose.connection.readyState === 1) {
        const jobs = await Job.find({ postedBy: req.user._id });
        const jobIds = jobs.map(j => j._id);
        totalJobs = jobs.length;

        const applications = await Application.find({ jobId: { $in: jobIds } });
        totalApplications = applications.length;

        applications.forEach(app => {
          if (statusCounts[app.status] !== undefined) {
            statusCounts[app.status]++;
          }
        });

        shortlisted = statusCounts.Shortlisted + statusCounts.Interview;
        hired = statusCounts.Hired;

        chartData = Object.entries(statusCounts).map(([name, value]) => ({
          name,
          value
        }));

        const jobsWithAppCount = [];
        for (const job of jobs) {
          const count = applications.filter(app => {
            const appJobId = app.jobId?._id || app.jobId;
            return appJobId.toString() === job._id.toString();
          }).length;
          
          jobsWithAppCount.push({
            _id: job._id,
            title: job.title,
            company: job.company,
            location: job.location,
            appCount: count,
            createdAt: job.createdAt
          });
        }
        recentJobs = jobsWithAppCount.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
      } else {
        const jobs = dbAdapter.findItems('jobs', j => j.postedBy.toString() === req.user._id.toString());
        const jobIds = jobs.map(j => j._id.toString());
        totalJobs = jobs.length;

        const applications = dbAdapter.findItems('applications', a => jobIds.includes(a.jobId.toString()));
        totalApplications = applications.length;

        applications.forEach(app => {
          if (statusCounts[app.status] !== undefined) {
            statusCounts[app.status]++;
          }
        });

        shortlisted = statusCounts.Shortlisted + statusCounts.Interview;
        hired = statusCounts.Hired;

        chartData = Object.entries(statusCounts).map(([name, value]) => ({
          name,
          value
        }));

        const jobsWithAppCount = [];
        for (const job of jobs) {
          const count = applications.filter(app => app.jobId.toString() === job._id.toString()).length;
          jobsWithAppCount.push({
            _id: job._id,
            title: job.title,
            company: job.company,
            location: job.location,
            appCount: count,
            createdAt: job.createdAt
          });
        }
        recentJobs = jobsWithAppCount.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
      }

      return res.json({
        totalJobs,
        totalApplications,
        shortlisted,
        hired,
        activeHires: hired,
        chartData,
        recentJobs
      });
    }

    if (isAdmin) {
      let totalJobs = 0;
      let totalApplications = 0;
      let shortlisted = 0;
      let hired = 0;
      let totalSeekers = 0;
      let totalRecruiters = 0;
      let chartData = [];

      const statusCounts = {
        Applied: 0,
        Reviewed: 0,
        Shortlisted: 0,
        Interview: 0,
        Rejected: 0,
        Hired: 0
      };

      if (mongoose.connection.readyState === 1) {
        totalJobs = await Job.countDocuments({});
        totalApplications = await Application.countDocuments({});
        totalSeekers = await User.countDocuments({ role: 'jobseeker' });
        totalRecruiters = await User.countDocuments({ role: 'recruiter' });

        const applications = await Application.find({});
        applications.forEach(app => {
          if (statusCounts[app.status] !== undefined) {
            statusCounts[app.status]++;
          }
        });

        shortlisted = statusCounts.Shortlisted + statusCounts.Interview;
        hired = statusCounts.Hired;

        chartData = Object.entries(statusCounts).map(([name, value]) => ({
          name,
          value
        }));
      } else {
        totalJobs = dbAdapter.findItems('jobs').length;
        totalApplications = dbAdapter.findItems('applications').length;
        totalSeekers = dbAdapter.findItems('users', u => u.role === 'jobseeker').length;
        totalRecruiters = dbAdapter.findItems('users', u => u.role === 'recruiter').length;

        const applications = dbAdapter.findItems('applications');
        applications.forEach(app => {
          if (statusCounts[app.status] !== undefined) {
            statusCounts[app.status]++;
          }
        });

        shortlisted = statusCounts.Shortlisted + statusCounts.Interview;
        hired = statusCounts.Hired;

        chartData = Object.entries(statusCounts).map(([name, value]) => ({
          name,
          value
        }));
      }

      return res.json({
        totalJobs,
        totalApplications,
        shortlisted,
        hired,
        totalSeekers,
        totalRecruiters,
        chartData
      });
    }

  } catch (error) {
    console.error('Get Stats Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getPendingRecruiters = async (req, res) => {
  try {
    let recruiters = [];
    if (mongoose.connection.readyState === 1) {
      recruiters = await User.find({ role: 'recruiter', verificationStatus: 'pending' }).sort({ createdAt: -1 });
    } else {
      recruiters = dbAdapter.findItems('users', u => u.role === 'recruiter' && u.verificationStatus === 'pending');
      recruiters.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    res.json({ success: true, recruiters });
  } catch (error) {
    console.error('Get Pending Recruiters Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveRecruiter = async (req, res) => {
  try {
    const { id } = req.params;
    let recruiter;
    if (mongoose.connection.readyState === 1) {
      recruiter = await User.findByIdAndUpdate(id, { verificationStatus: 'approved' }, { new: true });
    } else {
      recruiter = dbAdapter.updateItem('users', id, { verificationStatus: 'approved' });
    }

    if (!recruiter) {
      return res.status(404).json({ success: false, message: 'Recruiter not found' });
    }
    res.json({ success: true, message: 'Recruiter approved successfully', recruiter });
  } catch (error) {
    console.error('Approve Recruiter Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectRecruiter = async (req, res) => {
  try {
    const { id } = req.params;
    let recruiter;
    if (mongoose.connection.readyState === 1) {
      recruiter = await User.findByIdAndUpdate(id, { verificationStatus: 'rejected' }, { new: true });
    } else {
      recruiter = dbAdapter.updateItem('users', id, { verificationStatus: 'rejected' });
    }

    if (!recruiter) {
      return res.status(404).json({ success: false, message: 'Recruiter not found' });
    }
    res.json({ success: true, message: 'Recruiter rejected successfully', recruiter });
  } catch (error) {
    console.error('Reject Recruiter Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    let users = [];
    if (mongoose.connection.readyState === 1) {
      users = await User.find({}).sort({ createdAt: -1 });
    } else {
      users = dbAdapter.findItems('users');
      users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    const safeUsers = users.map(u => {
      const uCopy = { ...u };
      if (uCopy.toObject) {
        const obj = uCopy.toObject();
        delete obj.password;
        return obj;
      }
      delete uCopy.password;
      return uCopy;
    });
    res.json({ success: true, users: safeUsers });
  } catch (error) {
    console.error('Get All Users Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
