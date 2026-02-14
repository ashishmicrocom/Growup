import express from 'express';
import { createRazorpayOrder, verifyRazorpayPayment, getRazorpayKey } from '../controllers/paymentController.js';

const router = express.Router();

// GET /api/payment/key - Get Razorpay key
router.get('/key', getRazorpayKey);

// POST /api/payment/create-order - Create Razorpay order
router.post('/create-order', createRazorpayOrder);

// POST /api/payment/verify - Verify Razorpay payment
router.post('/verify', verifyRazorpayPayment);

export default router;
