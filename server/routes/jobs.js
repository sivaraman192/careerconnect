import express from 'express';
import { getJobs, getJobById, createJob, updateJob, deleteJob } from '../controllers/jobController.js';
import { protect, checkRole, checkVerified } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getJobs);
router.get('/:id', getJobById);
router.post('/', protect, checkRole(['recruiter', 'admin']), checkVerified, createJob);
router.put('/:id', protect, checkRole(['recruiter', 'admin']), checkVerified, updateJob);
router.delete('/:id', protect, checkRole(['recruiter', 'admin']), checkVerified, deleteJob);

export default router;
