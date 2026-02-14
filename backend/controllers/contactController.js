import { sendContactEmail } from '../services/emailService.js';
import Contact from '../models/Contact.js';
import User from '../models/User.js';
import { createNotification } from './notificationController.js';

// @desc    Send contact form email and save to database
// @route   POST /api/contact
// @access  Public
export const sendContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message, type } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Save to database
    const contact = await Contact.create({
      name,
      email,
      phone,
      subject,
      message,
      type: type || 'general'
    });

    // Send email
    try {
      await sendContactEmail({ name, email, subject, message });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue even if email fails - we saved to database
    }

    return res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you within 24 hours.',
      data: contact
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send message. Please try again later.'
    });
  }
};

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private/Admin
export const getAllContacts = async (req, res) => {
  try {
    const { status, type, read, page = 1, limit = 50 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (read !== undefined) query.read = read === 'true';

    const skip = (page - 1) * limit;

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Contact.countDocuments(query);
    const unreadCount = await Contact.countDocuments({ read: false });

    return res.status(200).json({
      success: true,
      count: contacts.length,
      total,
      unreadCount,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: contacts
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch contacts'
    });
  }
};

// @desc    Update contact status
// @route   PATCH /api/contact/:id
// @access  Private/Admin
export const updateContact = async (req, res) => {
  try {
    const { status, read } = req.body;
    const updates = {};
    
    if (status) updates.status = status;
    if (read !== undefined) updates.read = read;

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Update contact error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update contact'
    });
  }
};

// @desc    Delete contact
// @route   DELETE /api/contact/:id
// @access  Private/Admin
export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete contact'
    });
  }
};

// @desc    Reply to contact message
// @route   POST /api/contact/:id/reply
// @access  Private/Admin
export const replyToContact = async (req, res) => {
  try {
    console.log('=== REPLY TO CONTACT DEBUG ===');
    console.log('Contact ID:', req.params.id);
    console.log('Reply text:', req.body.reply);
    console.log('Admin user:', req.user?._id);

    const { reply } = req.body;

    if (!reply || !reply.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Reply message is required'
      });
    }

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      console.log('Contact not found');
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    console.log('Contact found:', {
      id: contact._id,
      email: contact.email,
      subject: contact.subject
    });

    // Update contact with reply
    contact.reply = reply;
    contact.repliedBy = req.user._id;
    contact.repliedAt = new Date();
    contact.status = 'replied';
    await contact.save();

    console.log('Contact updated with reply');

    // Find user by email to create notification
    const user = await User.findOne({ email: contact.email });

    console.log('Looking for user with email:', contact.email);
    console.log('User found:', user ? { id: user._id, email: user.email, role: user.role } : 'Not found');

    if (user) {
      // Create notification for the user
      try {
        console.log('Creating notification for user:', user._id);
        const notification = await createNotification(user._id, {
          type: 'contact_reply',
          title: 'Reply to Your Message',
          message: `Admin has replied to your message about "${contact.subject}"`,
          relatedId: contact._id,
          relatedModel: 'Contact',
          link: `/notifications`
        });
        console.log('✅ Notification created successfully:', notification._id);
      } catch (notifError) {
        console.error('❌ Failed to create notification:', notifError);
        console.error('Notification error details:', notifError.message);
        // Don't fail the whole request if notification fails
      }
    } else {
      console.log('⚠️ No user found with email:', contact.email, '- notification not created');
    }

    console.log('=== END REPLY DEBUG ===');

    return res.status(200).json({
      success: true,
      message: 'Reply sent successfully',
      data: contact
    });
  } catch (error) {
    console.error('Reply to contact error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send reply'
    });
  }
};

// @desc    Get user's own contact messages
// @route   GET /api/contact/my-messages
// @access  Private
export const getMyMessages = async (req, res) => {
  try {
    const userEmail = req.user.email;
    
    const messages = await Contact.find({ email: userEmail })
      .sort({ createdAt: -1 })
      .populate('repliedBy', 'firstName lastName email');

    return res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error('Get my messages error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch messages'
    });
  }
};


