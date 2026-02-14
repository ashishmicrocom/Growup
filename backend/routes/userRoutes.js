import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
  getUserStats,
  getUserTeam,
  getUserTeamEarnings,
  getUserTeamCommissionEarnings,
  getCurrentUserProfile,
  updateUserProfile,
  updateUserEmail,
  updateUserMobile,
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  getUserPayoutStatus,
  getUserPayoutStatusById
} from '../controllers/userController.js';
import { createUserValidation, updateUserValidation } from '../validators/userValidator.js';
import { validate } from '../middlewares/validate.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Stats route (must be before /:id)
router.get('/stats', getUserStats);

// Profile routes (authenticated user)
router.get('/profile', protect, getCurrentUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/profile/email', protect, updateUserEmail);
router.put('/profile/mobile', protect, updateUserMobile);

// Address routes (authenticated user)
router.get('/profile/addresses', protect, getUserAddresses);
router.post('/profile/addresses', protect, addUserAddress);
router.put('/profile/addresses/:id', protect, updateUserAddress);
router.delete('/profile/addresses/:id', protect, deleteUserAddress);

// Payout status route (authenticated user)
router.get('/profile/payout-status', protect, getUserPayoutStatus);

// CRUD routes
router.route('/')
  .get(getAllUsers)
  .post(createUserValidation, validate, createUser);

router.route('/:id')
  .get(getUserById)
  .put(updateUserValidation, validate, updateUser)
  .delete(deleteUser);

// Team hierarchy route
router.get('/:id/team', getUserTeam);

// Team earnings route
router.get('/:id/team-earnings', protect, admin, getUserTeamEarnings);

// Team commission earnings route (shows sum of commissions from team sales)
router.get('/:id/team-commission-earnings', protect, getUserTeamCommissionEarnings);

// Payout status route by ID (admin)
router.get('/:id/payout-status', protect, admin, getUserPayoutStatusById);

// Status toggle route
router.patch('/:id/status', toggleUserStatus);

export default router;
