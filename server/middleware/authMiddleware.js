import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import * as dbAdapter from '../utils/dbAdapter.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'careerconnectsecretkey123');
    
    let user;
    if (mongoose.connection.readyState === 1) {
      user = await User.findById(decoded.id);
    } else {
      user = dbAdapter.findOne('users', u => u._id.toString() === decoded.id.toString());
    }

    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    const userObj = user.toObject ? user.toObject() : { ...user };
    userObj._id = userObj._id.toString();
    userObj.id = userObj._id;
    req.user = userObj;

    console.log("Decoded user:", req.user);
    console.log("User role:", req.user.role);
    next();
  } catch (error) {
    console.error('Auth Error:', error.message);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied. Role '${req.user?.role || 'Guest'}' is not authorized.` });
    }
    next();
  };
};

export const checkVerified = (req, res, next) => {
  if (req.user && req.user.role === 'recruiter' && req.user.verificationStatus !== 'approved') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Your recruiter account is pending verification.'
    });
  }
  next();
};
