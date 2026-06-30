import express from 'express';
import { getStats, getPendingRecruiters, approveRecruiter, rejectRecruiter, getAllUsers } from '../controllers/adminController.js';
import { protect, checkRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, checkRole(['jobseeker', 'recruiter', 'admin']), getStats);
router.get('/recruiters/pending', protect, checkRole(['admin']), getPendingRecruiters);
router.put('/recruiters/:id/approve', protect, checkRole(['admin']), approveRecruiter);
router.put('/recruiters/:id/reject', protect, checkRole(['admin']), rejectRecruiter);
router.get('/users', protect, checkRole(['admin']), getAllUsers);

export default router;
