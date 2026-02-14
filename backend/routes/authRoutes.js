import express from 'express';
import * as authController from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/verify-email', authController.verifyEmail);
router.post('/login', authController.login);
router.post('/admin-login', authController.adminLogin);
router.post('/verify-login-otp', authController.verifyLoginOTP);
router.post('/resend-otp', authController.resendOTP);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/check-email', authController.checkEmail);
router.post('/validate-referral', authController.validateReferral);

// Protected routes
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);
router.put('/change-password', protect, authController.changePassword);
router.put('/profile', protect, authController.updateProfile);
router.delete('/account', protect, authController.deleteAccount);

export default router;
