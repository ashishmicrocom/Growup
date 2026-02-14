import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  toggleProductStatus,
  updateProductStock,
  deleteProduct,
  getProductStats,
  getPublicProducts,
  getPublicProductById
} from '../controllers/productController.js';
import { 
  createProductValidation, 
  updateProductValidation,
  updateStockValidation
} from '../validators/productValidator.js';
import { validate } from '../middlewares/validate.js';
import { upload } from '../config/multer.js';

const router = express.Router();

// Public routes - must be first
router.get('/public', getPublicProducts);
router.get('/public/:id', getPublicProductById);

// Stats route (must be before /:id)
router.get('/stats', getProductStats);

// CRUD routes
router.route('/')
  .get(getAllProducts)
  .post(
    upload.fields([
      { name: 'image', maxCount: 1 },
      { name: 'images', maxCount: 10 }
    ]), 
    createProductValidation, 
    validate, 
    createProduct
  );

router.route('/:id')
  .get(getProductById)
  .put(
    upload.fields([
      { name: 'image', maxCount: 1 },
      { name: 'images', maxCount: 10 }
    ]),
    updateProductValidation, 
    validate, 
    updateProduct
  )
  .delete(deleteProduct);

// Toggle active status
router.patch('/:id/toggle', toggleProductStatus);

// Update stock
router.patch('/:id/stock', updateStockValidation, validate, updateProductStock);

export default router;
