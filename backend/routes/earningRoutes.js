import express from 'express';
import * as earningController from '../controllers/earningController.js';

const router = express.Router();

// Earnings statistics and analytics
router.get('/stats', earningController.getEarningsStats);
router.get('/trend', earningController.getEarningsTrend);
router.get('/top-resellers', earningController.getTopResellers);

// Payout CRUD operations
router.get('/payouts', earningController.getAllPayouts);
router.get('/payouts/:id', earningController.getPayoutById);
router.post('/payouts', earningController.createPayout);
router.put('/payouts/:id', earningController.updatePayout);
router.patch('/payouts/:id/status', earningController.updatePayoutStatus);
router.delete('/payouts/:id', earningController.deletePayout);

export default router;
