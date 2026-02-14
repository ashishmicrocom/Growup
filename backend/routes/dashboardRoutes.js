import express from 'express';
import * as dashboardController from '../controllers/dashboardController.js';

const router = express.Router();

// Dashboard statistics and data
router.get('/stats', dashboardController.getDashboardStats);
router.get('/sales', dashboardController.getSalesData);
router.get('/categories', dashboardController.getCategoryDistribution);
router.get('/recent-orders', dashboardController.getRecentOrders);
router.get('/recent-activity', dashboardController.getRecentActivity);

export default router;
