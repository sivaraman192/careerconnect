import express from 'express';
import { saveJob, getSavedJobs, unsaveJob } from '../controllers/savedController.js';
import { protect, checkRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/:jobId', protect, checkRole(['jobseeker']), saveJob);
router.get('/', protect, checkRole(['jobseeker']), getSavedJobs);
router.delete('/:jobId', protect, checkRole(['jobseeker']), unsaveJob);

export default router;
