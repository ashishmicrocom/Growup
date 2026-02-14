import express from 'express';
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
  getOrderStats,
  getUserOrders
} from '../controllers/orderController.js';
import { 
  createOrderValidation, 
  updateOrderValidation,
  updateOrderStatusValidation 
} from '../validators/orderValidator.js';
import { validate } from '../middlewares/validate.js';
import { protect, optionalAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Stats route (must be before /:id)
router.get('/stats', getOrderStats);

// User orders route
router.get('/user/my-orders', protect, getUserOrders);

// CRUD routes
router.route('/')
  .get(getAllOrders)
  .post(optionalAuth, createOrderValidation, validate, createOrder);

router.route('/:id')
  .get(getOrderById)
  .put(updateOrderValidation, validate, updateOrder)
  .delete(deleteOrder);

// Status update route
router.patch('/:id/status', updateOrderStatusValidation, validate, updateOrderStatus);

export default router;
