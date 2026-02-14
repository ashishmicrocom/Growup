import express from 'express';
import { protect, admin } from '../middlewares/authMiddleware.js';
import { uploadRecognition } from '../config/multer.js';
import {
  getAllRecognitions,
  getAllRecognitionsAdmin,
  getRecognitionById,
  createRecognition,
  updateRecognition,
  deleteRecognition,
  bulkUpdateRecognitions
} from '../controllers/recognitionController.js';

const router = express.Router();

// Public routes
router.get('/', getAllRecognitions);

// Admin routes
router.get('/admin/all', protect, admin, getAllRecognitionsAdmin);
router.get('/:id', protect, admin, getRecognitionById);
router.post('/', protect, admin, uploadRecognition.single('logo'), createRecognition);
router.put('/:id', protect, admin, uploadRecognition.single('logo'), updateRecognition);
router.delete('/:id', protect, admin, deleteRecognition);
router.put('/bulk/update', protect, admin, bulkUpdateRecognitions);

export default router;
