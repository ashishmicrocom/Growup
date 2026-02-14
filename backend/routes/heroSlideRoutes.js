import express from 'express';
import {
  getAllHeroSlides,
  getAllHeroSlidesAdmin,
  getHeroSlideById,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  toggleHeroSlideStatus
} from '../controllers/heroSlideController.js';

const router = express.Router();

// Public route - get active slides only
router.get('/', getAllHeroSlides);

// Admin routes - specific routes must come before parameterized routes
router.get('/admin', getAllHeroSlidesAdmin);
router.post('/', createHeroSlide);
router.patch('/:id/toggle', toggleHeroSlideStatus);
router.get('/:id', getHeroSlideById);
router.put('/:id', updateHeroSlide);
router.delete('/:id', deleteHeroSlide);

export default router;
