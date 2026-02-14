import { body } from 'express-validator';

export const createOrderValidation = [
  // New structure validation
  body('items')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Items must be a non-empty array'),
  
  body('items.*.product')
    .optional()
    .notEmpty()
    .withMessage('Product ID is required for each item'),
  
  body('items.*.productName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product name is required for each item'),
  
  body('items.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  
  body('items.*.price')
    .optional()
    .isNumeric()
    .withMessage('Price must be a number'),
  
  body('items.*.resellerEarning')
    .optional()
    .isNumeric()
    .withMessage('Reseller earning must be a number'),
  
  body('shippingAddress')
    .optional()
    .isObject()
    .withMessage('Shipping address must be an object'),
  
  body('shippingAddress.name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Shipping name is required'),
  
  body('shippingAddress.phone')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Phone number is required'),
  
  body('shippingAddress.address')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  
  body('shippingAddress.city')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  
  body('shippingAddress.state')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  
  body('shippingAddress.pincode')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Pincode is required'),
  
  body('totalAmount')
    .optional()
    .isNumeric()
    .withMessage('Total amount must be a number'),
  
  body('totalEarnings')
    .optional()
    .isNumeric()
    .withMessage('Total earnings must be a number'),
  
  // Legacy fields for backward compatibility
  body('customer')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Customer name must be between 2 and 100 characters'),
  
  body('product')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  
  body('amount')
    .optional()
    .isNumeric()
    .withMessage('Amount must be a number')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  
  body('reseller')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Reseller name must be between 2 and 100 characters'),
  
  body('paymentStatus')
    .optional()
    .isIn(['paid', 'pending', 'failed'])
    .withMessage('Payment status must be paid, pending, or failed'),
  
  body('orderStatus')
    .optional()
    .isIn(['processing', 'ready_to_ship', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Order status must be processing, ready_to_ship, shipped, delivered, or cancelled')
];

export const updateOrderValidation = [
  body('customer')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Customer name must be between 2 and 100 characters'),
  
  body('product')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  
  body('amount')
    .optional()
    .isNumeric()
    .withMessage('Amount must be a number')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  
  body('reseller')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Reseller name must be between 2 and 100 characters'),
  
  body('paymentStatus')
    .optional()
    .isIn(['paid', 'pending', 'failed'])
    .withMessage('Payment status must be paid, pending, or failed'),
  
  body('orderStatus')
    .optional()
    .isIn(['processing', 'ready_to_ship', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Order status must be processing, ready_to_ship, shipped, delivered, or cancelled')
];

export const updateOrderStatusValidation = [
  body('orderStatus')
    .notEmpty()
    .withMessage('Order status is required')
    .isIn(['processing', 'ready_to_ship', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Order status must be processing, ready_to_ship, shipped, delivered, or cancelled')
];
