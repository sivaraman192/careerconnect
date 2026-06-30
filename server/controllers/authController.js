import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import * as dbAdapter from '../utils/dbAdapter.js';

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'careerconnectsecretkey123', {
    expiresIn: '30d'
  });
};

export const register = async (req, res) => {
  try {
    console.log("Register request body:", req.body);

    let { name, email, password, role, phone, skills, experience, portfolio, github, linkedin, companyName, companyWebsite, companySize, industry, companyLocation, designation, companyLogo } = req.body;

    const validRoles = ['jobseeker', 'recruiter', 'admin'];
    if (!role || !validRoles.includes(role)) {
      role = 'jobseeker';
    }

    const verificationStatus = role === 'recruiter' ? 'pending' : 'approved';

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    let user;
    if (mongoose.connection.readyState === 1) {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      const formattedSkills = Array.isArray(skills) 
        ? skills 
        : (skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : []);

      user = await User.create({
        name,
        email,
        password,
        role,
        verificationStatus,
        companyName: companyName || '',
        companyWebsite: companyWebsite || '',
        companySize: companySize || '',
        industry: industry || '',
        companyLocation: companyLocation || '',
        designation: designation || '',
        companyLogo: companyLogo || '',
        phone: phone || '',
        skills: formattedSkills,
        experience: experience || '',
        portfolio: portfolio || '',
        github: github || '',
        linkedin: linkedin || '',
        resume: ''
      });
    } else {
      const userExists = await dbAdapter.findOne('users', u => u.email === email);
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      const formattedSkills = Array.isArray(skills) 
        ? skills 
        : (skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : []);

      user = await dbAdapter.createItem('users', {
        name,
        email,
        password,
        role,
        verificationStatus,
        companyName: companyName || '',
        companyWebsite: companyWebsite || '',
        companySize: companySize || '',
        industry: industry || '',
        companyLocation: companyLocation || '',
        designation: designation || '',
        companyLogo: companyLogo || '',
        phone: phone || '',
        skills: formattedSkills,
        experience: experience || '',
        portfolio: portfolio || '',
        github: github || '',
        linkedin: linkedin || '',
        resume: ''
      });
    }

    console.log("Register response:", user);

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verificationStatus: user.verificationStatus,
        companyName: user.companyName,
        companyWebsite: user.companyWebsite,
        companySize: user.companySize,
        industry: user.industry,
        companyLocation: user.companyLocation,
        designation: user.designation,
        companyLogo: user.companyLogo,
        phone: user.phone,
        skills: user.skills,
        experience: user.experience,
        portfolio: user.portfolio,
        github: user.github,
        linkedin: user.linkedin,
        resume: user.resume
      }
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    let user;
    let isMatch = false;

    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
      isMatch = await user.comparePassword(password);
    } else {
      user = await dbAdapter.findOne('users', u => u.email === email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
      isMatch = await bcrypt.compare(password, user.password);
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verificationStatus: user.verificationStatus,
        companyName: user.companyName,
        companyWebsite: user.companyWebsite,
        companySize: user.companySize,
        industry: user.industry,
        companyLocation: user.companyLocation,
        designation: user.designation,
        companyLogo: user.companyLogo,
        phone: user.phone,
        skills: user.skills,
        experience: user.experience,
        portfolio: user.portfolio,
        github: user.github,
        linkedin: user.linkedin,
        resume: user.resume
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getMe = async (req, res) => {
  try {
    let user;
    if (mongoose.connection.readyState === 1) {
      user = await User.findById(req.user._id);
    } else {
      user = await dbAdapter.findOne('users', u => u._id.toString() === req.user._id.toString());
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verificationStatus: user.verificationStatus,
        companyName: user.companyName,
        companyWebsite: user.companyWebsite,
        companySize: user.companySize,
        industry: user.industry,
        companyLocation: user.companyLocation,
        designation: user.designation,
        companyLogo: user.companyLogo,
        phone: user.phone,
        skills: user.skills,
        experience: user.experience,
        portfolio: user.portfolio,
        github: user.github,
        linkedin: user.linkedin,
        resume: user.resume
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, skills, experience, portfolio, github, linkedin } = req.body;
    
    let user;
    if (mongoose.connection.readyState === 1) {
      user = await User.findById(req.user._id);
    } else {
      user = await dbAdapter.findOne('users', u => u._id.toString() === req.user._id.toString());
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updatedFields = {};
    if (name !== undefined) updatedFields.name = name;
    if (email !== undefined) updatedFields.email = email;
    if (phone !== undefined) updatedFields.phone = phone;
    if (skills !== undefined) {
      updatedFields.skills = Array.isArray(skills) 
        ? skills 
        : (typeof skills === 'string' ? skills.split(',').map(s => s.trim()).filter(Boolean) : []);
    }
    if (experience !== undefined) updatedFields.experience = experience;
    if (portfolio !== undefined) updatedFields.portfolio = portfolio;
    if (github !== undefined) updatedFields.github = github;
    if (linkedin !== undefined) updatedFields.linkedin = linkedin;

    if (req.file) {
      updatedFields.resume = `/uploads/${req.file.filename}`;
    }

    let updatedUser;
    if (mongoose.connection.readyState === 1) {
      updatedUser = await User.findByIdAndUpdate(req.user._id, { $set: updatedFields }, { new: true });
    } else {
      updatedUser = await dbAdapter.updateItem('users', req.user._id, updatedFields);
    }

    res.json({
      success: true,
      user: {
        id: updatedUser._id,
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        verificationStatus: updatedUser.verificationStatus,
        companyName: updatedUser.companyName,
        companyWebsite: updatedUser.companyWebsite,
        companySize: updatedUser.companySize,
        industry: updatedUser.industry,
        companyLocation: updatedUser.companyLocation,
        designation: updatedUser.designation,
        companyLogo: updatedUser.companyLogo,
        phone: updatedUser.phone,
        skills: updatedUser.skills,
        experience: updatedUser.experience,
        portfolio: updatedUser.portfolio,
        github: updatedUser.github,
        linkedin: updatedUser.linkedin,
        resume: updatedUser.resume
      }
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
