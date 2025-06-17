import express from 'express';
import {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
    getSupplierProducts,
    updateProductQuantity,
    getAllProducts,
    toggleProductVisibility
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);
router.get('/category/:category', getProductsByCategory);

// Supplier routes
router.get('/supplier/products', protect, getSupplierProducts);
router.post('/', protect, createProduct);
router.put('/:id', protect, updateProduct);
router.put('/:id/quantity', protect, updateProductQuantity);
router.delete('/:id', protect, deleteProduct);

// Admin routes
router.get('/admin/all', protect, getAllProducts);
router.put('/admin/:id/visibility', protect, toggleProductVisibility);

export default router; 