import express from 'express';
import { protect, checkRole, checkVerified } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { 
  applyJob, 
  getMyApplications, 
  getJobApplications, 
  updateApplicationStatus,
  getApplications,
  getRecruiterApplications,
  scheduleInterview,
  getCandidatePipeline,
  getApplicationById
} from '../controllers/applicationController.js';

const router = express.Router();

router.post('/apply/:jobId', protect, checkRole(['jobseeker']), upload.single('resume'), applyJob);
router.get('/my', protect, checkRole(['jobseeker']), getMyApplications);
router.get('/', protect, checkRole(['recruiter', 'admin']), checkVerified, getApplications);
router.get('/pipeline', protect, checkRole(['recruiter', 'admin']), checkVerified, getCandidatePipeline);
router.get('/recruiter', protect, checkRole(['recruiter', 'admin']), checkVerified, getRecruiterApplications);
router.get('/job/:jobId', protect, checkRole(['recruiter', 'admin']), checkVerified, getJobApplications);
router.get('/:id', protect, checkRole(['recruiter', 'admin']), checkVerified, getApplicationById);
router.put('/:id/status', protect, checkRole(['recruiter', 'admin']), checkVerified, updateApplicationStatus);
router.put('/:id/interview', protect, checkRole(['recruiter', 'admin']), checkVerified, scheduleInterview);

export default router;
