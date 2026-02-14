import { body } from 'express-validator';

export const createProductValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  
  body('image')
    .optional()
    .trim(),
  
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isNumeric()
    .withMessage('Price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('commission')
    .notEmpty()
    .withMessage('Commission is required')
    .isNumeric()
    .withMessage('Commission must be a number')
    .isFloat({ min: 0 })
    .withMessage('Commission must be a positive number'),
  
  body('stock')
    .optional()
    .isIn(['in_stock', 'low_stock', 'out_of_stock'])
    .withMessage('Stock must be in_stock, low_stock, or out_of_stock'),
  
  body('active')
    .optional()
    .isBoolean()
    .withMessage('Active must be a boolean'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('stockQuantity')
    .optional()
    .isNumeric()
    .withMessage('Stock quantity must be a number')
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a positive integer')
];

export const updateProductValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  
  body('image')
    .optional()
    .trim(),
  
  body('category')
    .optional()
    .trim(),
  
  body('price')
    .optional()
    .isNumeric()
    .withMessage('Price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('commission')
    .optional()
    .isNumeric()
    .withMessage('Commission must be a number')
    .isFloat({ min: 0 })
    .withMessage('Commission must be a positive number'),
  
  body('stock')
    .optional()
    .isIn(['in_stock', 'low_stock', 'out_of_stock'])
    .withMessage('Stock must be in_stock, low_stock, or out_of_stock'),
  
  body('active')
    .optional()
    .isBoolean()
    .withMessage('Active must be a boolean'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('stockQuantity')
    .optional()
    .isNumeric()
    .withMessage('Stock quantity must be a number')
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a positive integer')
];

export const updateStockValidation = [
  body('stock')
    .optional()
    .isIn(['in_stock', 'low_stock', 'out_of_stock'])
    .withMessage('Stock must be in_stock, low_stock, or out_of_stock'),
  
  body('stockQuantity')
    .optional()
    .isNumeric()
    .withMessage('Stock quantity must be a number')
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a positive integer')
];
