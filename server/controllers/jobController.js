import mongoose from 'mongoose';
import Job from '../models/Job.js';
import * as dbAdapter from '../utils/dbAdapter.js';

export const getJobs = async (req, res) => {
  try {
    const { search, location, jobType, experience, skills, salary } = req.query;
    let jobs = [];

    if (mongoose.connection.readyState === 1) {
      const filter = {};
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      if (location) {
        filter.location = { $regex: location, $options: 'i' };
      }
      if (jobType) {
        filter.jobType = jobType;
      }
      if (experience) {
        filter.experience = experience;
      }
      if (salary) {
        filter.salary = { $regex: salary, $options: 'i' };
      }
      if (skills) {
        const skillsArr = skills.split(',').map(s => s.trim()).filter(Boolean);
        if (skillsArr.length > 0) {
          filter.skills = { $in: skillsArr };
        }
      }
      jobs = await Job.find(filter).populate('postedBy').sort({ createdAt: -1 });
    } else {
      jobs = dbAdapter.findItems('jobs', (j) => {
        if (search) {
          const searchRegex = new RegExp(search, 'i');
          const match = searchRegex.test(j.title || '') || searchRegex.test(j.company || '') || searchRegex.test(j.description || '');
          if (!match) return false;
        }
        if (location) {
          const locRegex = new RegExp(location, 'i');
          if (!locRegex.test(j.location || '')) return false;
        }
        if (jobType && j.jobType !== jobType) {
          return false;
        }
        if (experience && j.experience !== experience) {
          return false;
        }
        if (salary) {
          const salRegex = new RegExp(salary, 'i');
          if (!salRegex.test(j.salary || '')) return false;
        }
        if (skills) {
          const skillsArr = skills.split(',').map(s => s.trim()).filter(Boolean);
          if (skillsArr.length > 0) {
            const hasSkill = skillsArr.some(s => j.skills && j.skills.includes(s));
            if (!hasSkill) return false;
          }
        }
        return true;
      });

      jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      jobs = jobs.map(job => {
        const jobCopy = { ...job };
        if (jobCopy.postedBy) {
          const user = dbAdapter.findOne('users', u => u._id.toString() === jobCopy.postedBy.toString());
          if (user) {
            const userCopy = { ...user };
            delete userCopy.password;
            jobCopy.postedBy = userCopy;
          }
        }
        return jobCopy;
      });
    }

    res.json({
      success: true,
      jobs: jobs || []
    });
  } catch (error) {
    console.error('Get Jobs Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getJobById = async (req, res) => {
  try {
    let job;
    if (mongoose.connection.readyState === 1) {
      job = await Job.findById(req.params.id).populate('postedBy');
    } else {
      job = dbAdapter.findOne('jobs', j => j._id.toString() === req.params.id.toString());
      if (job) {
        const jobCopy = { ...job };
        if (jobCopy.postedBy) {
          const user = dbAdapter.findOne('users', u => u._id.toString() === jobCopy.postedBy.toString());
          if (user) {
            const userCopy = { ...user };
            delete userCopy.password;
            jobCopy.postedBy = userCopy;
          }
        }
        job = jobCopy;
      }
    }

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    console.error('Get Job By ID Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const createJob = async (req, res) => {
  try {
    const { title, company, location, salary, jobType, experience, skills, description, responsibilities, requirements } = req.body;

    if (!title || !company || !location || !salary || !jobType || !experience) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const formattedSkills = Array.isArray(skills) 
      ? skills 
      : (skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : []);
      
    const formattedResponsibilities = Array.isArray(responsibilities) 
      ? responsibilities 
      : (responsibilities ? responsibilities.split('\n').map(r => r.trim()).filter(Boolean) : []);
      
    const formattedRequirements = Array.isArray(requirements) 
      ? requirements 
      : (requirements ? requirements.split('\n').map(r => r.trim()).filter(Boolean) : []);

    let job;
    if (mongoose.connection.readyState === 1) {
      job = await Job.create({
        title,
        company,
        location,
        salary,
        jobType,
        experience,
        skills: formattedSkills,
        description: description || '',
        responsibilities: formattedResponsibilities,
        requirements: formattedRequirements,
        postedBy: req.user._id
      });
    } else {
      job = await dbAdapter.createItem('jobs', {
        title,
        company,
        location,
        salary,
        jobType,
        experience,
        skills: formattedSkills,
        description: description || '',
        responsibilities: formattedResponsibilities,
        requirements: formattedRequirements,
        postedBy: req.user._id
      });
    }

    res.status(201).json(job);
  } catch (error) {
    console.error('Create Job Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateJob = async (req, res) => {
  try {
    let job;
    if (mongoose.connection.readyState === 1) {
      job = await Job.findById(req.params.id);
    } else {
      job = dbAdapter.findOne('jobs', j => j._id.toString() === req.params.id.toString());
    }

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this job' });
    }

    const { title, company, location, salary, jobType, experience, skills, description, responsibilities, requirements } = req.body;

    const updatedFields = {};
    if (title) updatedFields.title = title;
    if (company) updatedFields.company = company;
    if (location) updatedFields.location = location;
    if (salary) updatedFields.salary = salary;
    if (jobType) updatedFields.jobType = jobType;
    if (experience) updatedFields.experience = experience;
    if (description !== undefined) updatedFields.description = description;
    
    if (skills !== undefined) {
      updatedFields.skills = Array.isArray(skills) 
        ? skills 
        : skills.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (responsibilities !== undefined) {
      updatedFields.responsibilities = Array.isArray(responsibilities) 
        ? responsibilities 
        : responsibilities.split('\n').map(r => r.trim()).filter(Boolean);
    }
    if (requirements !== undefined) {
      updatedFields.requirements = Array.isArray(requirements) 
        ? requirements 
        : requirements.split('\n').map(r => r.trim()).filter(Boolean);
    }

    let updatedJob;
    if (mongoose.connection.readyState === 1) {
      updatedJob = await Job.findByIdAndUpdate(req.params.id, { $set: updatedFields }, { new: true }).populate('postedBy');
    } else {
      updatedJob = dbAdapter.updateItem('jobs', req.params.id, updatedFields);
      if (updatedJob) {
        const jobCopy = { ...updatedJob };
        if (jobCopy.postedBy) {
          const user = dbAdapter.findOne('users', u => u._id.toString() === jobCopy.postedBy.toString());
          if (user) {
            const userCopy = { ...user };
            delete userCopy.password;
            jobCopy.postedBy = userCopy;
          }
        }
        updatedJob = jobCopy;
      }
    }

    res.json(updatedJob);
  } catch (error) {
    console.error('Update Job Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteJob = async (req, res) => {
  try {
    let job;
    if (mongoose.connection.readyState === 1) {
      job = await Job.findById(req.params.id);
    } else {
      job = dbAdapter.findOne('jobs', j => j._id.toString() === req.params.id.toString());
    }

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this job' });
    }

    if (mongoose.connection.readyState === 1) {
      await Job.findByIdAndDelete(req.params.id);
    } else {
      dbAdapter.deleteItem('jobs', req.params.id);
    }

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete Job Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
