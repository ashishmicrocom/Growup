import express from 'express';
import { sendContact, getAllContacts, updateContact, deleteContact, replyToContact, getMyMessages } from '../controllers/contactController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// POST /api/contact - Send contact form email (Public)
router.post('/', sendContact);

// GET /api/contact/my-messages - Get user's own messages (User authenticated)
router.get('/my-messages', protect, getMyMessages);

// GET /api/contact - Get all contacts (Admin only)
router.get('/', protect, admin, getAllContacts);

// PATCH /api/contact/:id - Update contact (Admin only)
router.patch('/:id', protect, admin, updateContact);

// POST /api/contact/:id/reply - Reply to contact (Admin only)
router.post('/:id/reply', protect, admin, replyToContact);

// DELETE /api/contact/:id - Delete contact (Admin only)
router.delete('/:id', protect, admin, deleteContact);

export default router;
