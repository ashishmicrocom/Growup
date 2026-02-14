import express from 'express';
import {
  getPublicCategories,
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus
} from '../controllers/categoryController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/public', getPublicCategories);

// Admin routes
router.get('/', protect, admin, getAllCategories);
router.get('/:id', protect, admin, getCategoryById);
router.post('/', protect, admin, createCategory);
router.put('/:id', protect, admin, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);
router.patch('/:id/toggle-status', protect, admin, toggleCategoryStatus);

export default router;
