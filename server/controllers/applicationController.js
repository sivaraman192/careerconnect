import mongoose from 'mongoose';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import * as dbAdapter from '../utils/dbAdapter.js';

const mapAppFallback = (app) => {
  if (!app) return null;
  const appCopy = { ...app };
  delete appCopy.__v;
  if (appCopy.jobId) {
    const job = dbAdapter.findOne('jobs', j => j._id.toString() === appCopy.jobId.toString());
    if (job) {
      const jobCopy = { ...job };
      delete jobCopy.__v;
      if (jobCopy.postedBy) {
        const poster = dbAdapter.findOne('users', u => u._id.toString() === jobCopy.postedBy.toString());
        if (poster) {
          const posterCopy = { ...poster };
          delete posterCopy.password;
          delete posterCopy.__v;
          jobCopy.postedBy = posterCopy;
        }
      }
      appCopy.jobId = jobCopy;
    }
  }
  if (appCopy.userId) {
    const user = dbAdapter.findOne('users', u => u._id.toString() === appCopy.userId.toString());
    if (user) {
      const userCopy = { ...user };
      delete userCopy.password;
      delete userCopy.__v;
      appCopy.userId = userCopy;
    }
  }
  return appCopy;
};

export const applyJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { name, email, phone, portfolio, github, coverLetter } = req.body;

    let job;
    if (mongoose.connection.readyState === 1) {
      job = await Job.findById(jobId);
    } else {
      job = dbAdapter.findOne('jobs', j => j._id.toString() === jobId.toString());
    }

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    let alreadyApplied;
    if (mongoose.connection.readyState === 1) {
      alreadyApplied = await Application.findOne({ jobId, userId: req.user._id });
    } else {
      alreadyApplied = dbAdapter.findOne('applications', a => a.jobId.toString() === jobId.toString() && a.userId.toString() === req.user._id.toString());
    }

    if (alreadyApplied) {
      return res.status(400).json({ success: false, message: 'You have already applied to this job' });
    }

    let resumePath = '';
    if (req.file) {
      resumePath = `/uploads/${req.file.filename}`;
    } else if (req.user.resume) {
      resumePath = req.user.resume;
    } else {
      let userRecord;
      if (mongoose.connection.readyState === 1) {
        const User = mongoose.model('User');
        userRecord = await User.findById(req.user._id);
      } else {
        userRecord = dbAdapter.findOne('users', u => u._id.toString() === req.user._id.toString());
      }
      if (userRecord && userRecord.resume) {
        resumePath = userRecord.resume;
      } else {
        return res.status(400).json({ success: false, message: 'Please upload your resume' });
      }
    }

    let application;
    if (mongoose.connection.readyState === 1) {
      application = await Application.create({
        jobId,
        userId: req.user._id,
        name,
        email,
        phone: phone || '',
        portfolio: portfolio || '',
        github: github || '',
        coverLetter: coverLetter || '',
        resume: resumePath,
        status: 'Applied'
      });
    } else {
      application = await dbAdapter.createItem('applications', {
        jobId,
        userId: req.user._id,
        name,
        email,
        phone: phone || '',
        portfolio: portfolio || '',
        github: github || '',
        coverLetter: coverLetter || '',
        resume: resumePath,
        status: 'Applied'
      });
    }

    res.status(201).json(application);
  } catch (error) {
    console.error('Apply Job Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    let applications = [];
    if (mongoose.connection.readyState === 1) {
      applications = await Application.find({ userId: req.user._id })
        .select('-__v')
        .populate({ path: 'jobId', select: '-__v', populate: { path: 'postedBy', select: '-password -__v' } })
        .sort({ createdAt: -1 });
    } else {
      applications = dbAdapter.findItems('applications', a => a.userId.toString() === req.user._id.toString());
      applications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      applications = applications.map(mapAppFallback);
    }

    res.json({
      success: true,
      applications: applications || []
    });
  } catch (error) {
    console.error('Get My Applications Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getJobApplications = async (req, res) => {
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

    const postedById = job.postedBy?._id || job.postedBy;
    if (postedById.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view applications for this job' });
    }

    let applications = [];
    if (mongoose.connection.readyState === 1) {
      applications = await Application.find({ jobId })
        .select('-__v')
        .populate('userId', '-password -__v')
        .sort({ createdAt: -1 });
    } else {
      applications = dbAdapter.findItems('applications', a => a.jobId.toString() === jobId.toString());
      applications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      applications = applications.map(app => {
        const appCopy = { ...app };
        delete appCopy.__v;
        if (appCopy.userId) {
          const user = dbAdapter.findOne('users', u => u._id.toString() === appCopy.userId.toString());
          if (user) {
            const userCopy = { ...user };
            delete userCopy.password;
            delete userCopy.__v;
            appCopy.userId = userCopy;
          }
        }
        return appCopy;
      });
    }
    res.json(applications);
  } catch (error) {
    console.error('Get Job Applications Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getApplications = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const isRecruiter = req.user.role === 'recruiter';

    if (!isAdmin && !isRecruiter) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    let applications = [];
    if (mongoose.connection.readyState === 1) {
      if (isAdmin) {
        applications = await Application.find({})
          .select('-__v')
          .populate({ path: 'jobId', select: '-__v', populate: { path: 'postedBy', select: '-password -__v' } })
          .populate('userId', '-password -__v')
          .sort({ createdAt: -1 });
      } else {
        const jobs = await Job.find({ postedBy: req.user._id });
        const jobIds = jobs.map(j => j._id);
        applications = await Application.find({ jobId: { $in: jobIds } })
          .select('-__v')
          .populate({ path: 'jobId', select: '-__v', populate: { path: 'postedBy', select: '-password -__v' } })
          .populate('userId', '-password -__v')
          .sort({ createdAt: -1 });
      }
    } else {
      if (isAdmin) {
        applications = dbAdapter.findItems('applications');
        applications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        applications = applications.map(mapAppFallback);
      } else {
        const jobs = dbAdapter.findItems('jobs', j => j.postedBy.toString() === req.user._id.toString());
        const jobIds = jobs.map(j => j._id.toString());
        applications = dbAdapter.findItems('applications', a => jobIds.includes(a.jobId.toString()));
        applications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        applications = applications.map(mapAppFallback);
      }
    }

    res.json({
      success: true,
      applications: applications || []
    });
  } catch (error) {
    console.error('Get Applications Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCandidatePipeline = async (req, res) => {
  try {
    console.log("Decoded user:", req.user);
    console.log("Pipeline role:", req.user.role);

    const isAdmin = req.user.role === 'admin';
    const isRecruiter = req.user.role === 'recruiter';

    if (!isAdmin && !isRecruiter) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    let applications = [];
    if (mongoose.connection.readyState === 1) {
      if (isAdmin) {
        applications = await Application.find({})
          .select('-__v')
          .populate({ path: 'jobId', select: '-__v', populate: { path: 'postedBy', select: '-password -__v' } })
          .populate('userId', '-password -__v')
          .sort({ createdAt: -1 });
      } else {
        const jobs = await Job.find({ postedBy: req.user._id });
        const jobIds = jobs.map(j => j._id);
        applications = await Application.find({ jobId: { $in: jobIds } })
          .select('-__v')
          .populate({ path: 'jobId', select: '-__v', populate: { path: 'postedBy', select: '-password -__v' } })
          .populate('userId', '-password -__v')
          .sort({ createdAt: -1 });
      }
    } else {
      if (isAdmin) {
        applications = dbAdapter.findItems('applications');
        applications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        applications = applications.map(mapAppFallback);
      } else {
        const jobs = dbAdapter.findItems('jobs', j => j.postedBy.toString() === req.user._id.toString());
        const jobIds = jobs.map(j => j._id.toString());
        applications = dbAdapter.findItems('applications', a => jobIds.includes(a.jobId.toString()));
        applications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        applications = applications.map(mapAppFallback);
      }
    }

    const formatted = applications.map(app => {
      const obj = app.toObject ? app.toObject() : { ...app };
      const userObj = obj.userId || {};
      delete obj.userId;
      const jobObj = obj.jobId || {};
      delete obj.jobId;

      return {
        ...obj,
        user: {
          name: userObj.name || '',
          email: userObj.email || '',
          phone: userObj.phone || '',
          skills: userObj.skills || [],
          experience: userObj.experience || '',
          portfolio: userObj.portfolio || '',
          github: userObj.github || '',
          linkedin: userObj.linkedin || ''
        },
        job: {
          title: jobObj.title || '',
          company: jobObj.company || '',
          location: jobObj.location || '',
          jobType: jobObj.jobType || '',
          salary: jobObj.salary || ''
        }
      };
    });

    res.json({
      success: true,
      applications: formatted
    });
  } catch (error) {
    console.error('Get Candidate Pipeline Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    let application;
    if (mongoose.connection.readyState === 1) {
      application = await Application.findById(id)
        .select('-__v')
        .populate({ path: 'jobId', select: '-__v', populate: { path: 'postedBy', select: '-password -__v' } })
        .populate('userId', '-password -__v');
    } else {
      application = dbAdapter.findOne('applications', a => a._id.toString() === id.toString());
      if (application) {
        application = mapAppFallback(application);
      }
    }

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    let postedBy = null;
    if (mongoose.connection.readyState === 1) {
      const jobObj = application.jobId;
      postedBy = jobObj?.postedBy?._id || jobObj?.postedBy;
    } else {
      const jobObj = application.jobId;
      postedBy = jobObj?.postedBy;
    }

    if (req.user.role !== 'admin' && (!postedBy || postedBy.toString() !== req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this application' });
    }

    const obj = application.toObject ? application.toObject() : { ...application };
    const userObj = obj.userId || {};
    delete obj.userId;
    const jobObj = obj.jobId || {};
    delete obj.jobId;

    const formatted = {
      ...obj,
      user: {
        name: userObj.name || '',
        email: userObj.email || '',
        phone: userObj.phone || '',
        skills: userObj.skills || [],
        experience: userObj.experience || '',
        portfolio: userObj.portfolio || '',
        github: userObj.github || '',
        linkedin: userObj.linkedin || ''
      },
      job: {
        title: jobObj.title || '',
        company: jobObj.company || '',
        location: jobObj.location || '',
        jobType: jobObj.jobType || '',
        salary: jobObj.salary || ''
      }
    };

    res.json({
      success: true,
      application: formatted
    });
  } catch (error) {
    console.error('Get Application By ID Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRecruiterApplications = async (req, res) => {
  try {
    let applications = [];
    if (mongoose.connection.readyState === 1) {
      const jobs = await Job.find({ postedBy: req.user._id });
      const jobIds = jobs.map(j => j._id);
      applications = await Application.find({ jobId: { $in: jobIds } })
        .select('-__v')
        .populate({ path: 'jobId', select: '-__v', populate: { path: 'postedBy', select: '-password -__v' } })
        .populate('userId', '-password -__v')
        .sort({ createdAt: -1 });
    } else {
      const jobs = dbAdapter.findItems('jobs', j => j.postedBy.toString() === req.user._id.toString());
      const jobIds = jobs.map(j => j._id.toString());
      applications = dbAdapter.findItems('applications', a => jobIds.includes(a.jobId.toString()));
      applications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      applications = applications.map(mapAppFallback);
    }
    res.json({ success: true, applications: applications || [] });
  } catch (error) {
    console.error('Get Recruiter Applications Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, interviewDate } = req.body;

    const allowedStatuses = ['Applied', 'Reviewed', 'Shortlisted', 'Interview', 'Rejected', 'Hired'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    let application;
    if (mongoose.connection.readyState === 1) {
      application = await Application.findById(id).populate('jobId');
    } else {
      application = dbAdapter.findOne('applications', a => a._id.toString() === id.toString());
    }

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    let postedBy = null;
    if (mongoose.connection.readyState === 1) {
      if (application.jobId && application.jobId.postedBy) {
        postedBy = application.jobId.postedBy._id || application.jobId.postedBy;
      } else {
        const job = await Job.findById(application.jobId);
        postedBy = job?.postedBy;
      }
    } else {
      if (application.jobId) {
        const job = dbAdapter.findOne('jobs', j => j._id.toString() === application.jobId.toString());
        postedBy = job?.postedBy;
      }
    }

    if (req.user.role !== 'admin' && (!postedBy || postedBy.toString() !== req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized to update status for this application' });
    }

    const updatedFields = {
      updatedBy: req.user._id
    };
    if (status !== undefined) updatedFields.status = status;
    if (notes !== undefined) updatedFields.notes = notes;
    if (interviewDate !== undefined) updatedFields.interviewDate = interviewDate;

    let updatedApp;
    if (mongoose.connection.readyState === 1) {
      updatedApp = await Application.findByIdAndUpdate(
        id,
        { $set: updatedFields },
        { new: true }
      )
        .select('-__v')
        .populate({ path: 'jobId', select: '-__v', populate: { path: 'postedBy', select: '-password -__v' } })
        .populate('userId', '-password -__v');
    } else {
      updatedApp = dbAdapter.updateItem('applications', id, updatedFields);
      if (updatedApp) {
        updatedApp = mapAppFallback(updatedApp);
      }
    }

    const obj = updatedApp.toObject ? updatedApp.toObject() : { ...updatedApp };
    const userObj = obj.userId || {};
    delete obj.userId;
    const jobObj = obj.jobId || {};
    delete obj.jobId;

    const formatted = {
      ...obj,
      user: {
        name: userObj.name || '',
        email: userObj.email || '',
        phone: userObj.phone || '',
        skills: userObj.skills || [],
        experience: userObj.experience || '',
        portfolio: userObj.portfolio || '',
        github: userObj.github || '',
        linkedin: userObj.linkedin || ''
      },
      job: {
        title: jobObj.title || '',
        company: jobObj.company || '',
        location: jobObj.location || '',
        jobType: jobObj.jobType || '',
        salary: jobObj.salary || ''
      }
    };

    res.json({ success: true, application: formatted });
  } catch (error) {
    console.error('Update Application Status Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const scheduleInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { interviewDate, notes } = req.body;

    if (!interviewDate) {
      return res.status(400).json({ success: false, message: 'Interview date is required' });
    }

    let application;
    if (mongoose.connection.readyState === 1) {
      application = await Application.findById(id).populate('jobId');
    } else {
      application = dbAdapter.findOne('applications', a => a._id.toString() === id.toString());
    }

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    let postedBy = null;
    if (mongoose.connection.readyState === 1) {
      if (application.jobId && application.jobId.postedBy) {
        postedBy = application.jobId.postedBy._id || application.jobId.postedBy;
      } else {
        const job = await Job.findById(application.jobId);
        postedBy = job?.postedBy;
      }
    } else {
      if (application.jobId) {
        const job = dbAdapter.findOne('jobs', j => j._id.toString() === application.jobId.toString());
        postedBy = job?.postedBy;
      }
    }

    if (req.user.role !== 'admin' && (!postedBy || postedBy.toString() !== req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized to update status for this application' });
    }

    const updatedFields = {
      status: 'Interview',
      interviewDate,
      updatedBy: req.user._id
    };
    if (notes !== undefined) updatedFields.notes = notes;

    let updatedApp;
    if (mongoose.connection.readyState === 1) {
      updatedApp = await Application.findByIdAndUpdate(
        id,
        { $set: updatedFields },
        { new: true }
      )
        .select('-__v')
        .populate({ path: 'jobId', select: '-__v', populate: { path: 'postedBy', select: '-password -__v' } })
        .populate('userId', '-password -__v');
    } else {
      updatedApp = dbAdapter.updateItem('applications', id, updatedFields);
      if (updatedApp) {
        updatedApp = mapAppFallback(updatedApp);
      }
    }

    const obj = updatedApp.toObject ? updatedApp.toObject() : { ...updatedApp };
    const userObj = obj.userId || {};
    delete obj.userId;
    const jobObj = obj.jobId || {};
    delete obj.jobId;

    const formatted = {
      ...obj,
      user: {
        name: userObj.name || '',
        email: userObj.email || '',
        phone: userObj.phone || '',
        skills: userObj.skills || [],
        experience: userObj.experience || '',
        portfolio: userObj.portfolio || '',
        github: userObj.github || '',
        linkedin: userObj.linkedin || ''
      },
      job: {
        title: jobObj.title || '',
        company: jobObj.company || '',
        location: jobObj.location || '',
        jobType: jobObj.jobType || '',
        salary: jobObj.salary || ''
      }
    };

    res.json({ success: true, application: formatted });
  } catch (error) {
    console.error('Schedule Interview Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
