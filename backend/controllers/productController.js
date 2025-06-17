import Product from '../models/Product.js';
import asyncHandler from 'express-async-handler';

// Get all products
export const getProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({ isVisible: true })
        .populate('supplier', 'firstName lastName email')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: products.length,
        products
    });
});

// Get all products (including hidden) - Admin only
export const getAllProducts = asyncHandler(async (req, res) => {
    // Check if user is admin
    if (req.user.userType !== 'admin') {
        res.status(403);
        throw new Error('Only admins can access all products');
    }

    const products = await Product.find()
        .populate('supplier', 'firstName lastName email')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: products.length,
        products
    });
});

// Get single product
export const getProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
        .populate('supplier', 'firstName lastName email');

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    res.status(200).json({
        success: true,
        product
    });
});

// Create new product (supplier only)
export const createProduct = asyncHandler(async (req, res) => {
    // Check if user is a supplier
    if (req.user.userType !== 'supplier') {
        res.status(403);
        throw new Error('Only suppliers can create products');
    }

    const {
        name,
        price,
        image,
        category,
        description,
        quantity,
        brand,
        expiryDate,
        prescriptionRequired
    } = req.body;

    // Validate expiry date
    if (new Date(expiryDate) <= new Date()) {
        res.status(400);
        throw new Error('Expiry date must be in the future');
    }

    const product = await Product.create({
        name,
        price,
        image,
        category,
        description,
        quantity,
        brand,
        expiryDate,
        prescriptionRequired,
        supplier: req.user._id
    });

    res.status(201).json({
        success: true,
        message: 'Product created successfully',
        product
    });
});

// Update product (supplier only)
export const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    // Check if user is the supplier of this product
    if (product.supplier.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this product');
    }

    const {
        name,
        price,
        image,
        category,
        description,
        quantity,
        brand,
        expiryDate,
        prescriptionRequired
    } = req.body;

    // Validate expiry date if provided
    if (expiryDate && new Date(expiryDate) <= new Date()) {
        res.status(400);
        throw new Error('Expiry date must be in the future');
    }

    // Calculate new quantity and outOfStock status
    const newQuantity = quantity !== undefined ? quantity : product.quantity;
    const outOfStock = newQuantity <= 0;

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: name || product.name,
            price: price || product.price,
            image: image || product.image,
            category: category || product.category,
            description: description || product.description,
            quantity: newQuantity,
            brand: brand || product.brand,
            expiryDate: expiryDate || product.expiryDate,
            prescriptionRequired: prescriptionRequired !== undefined ? prescriptionRequired : product.prescriptionRequired,
            outOfStock: outOfStock
        },
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        product: updatedProduct
    });
});

// Delete product (supplier only)
export const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    // Check if user is the supplier of this product
    if (product.supplier.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to delete this product');
    }

    await product.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Product deleted successfully'
    });
});

// Get products by category
export const getProductsByCategory = asyncHandler(async (req, res) => {
    const products = await Product.find({ category: req.params.category })
        .populate('supplier', 'firstName lastName email');

    res.status(200).json({
        success: true,
        count: products.length,
        products
    });
});

// Get supplier's products
export const getSupplierProducts = asyncHandler(async (req, res) => {
    // Check if user is a supplier
    if (req.user.userType !== 'supplier') {
        res.status(403);
        throw new Error('Only suppliers can access their products');
    }

    const products = await Product.find({ supplier: req.user._id })
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: products.length,
        products
    });
});

// Update product quantity
export const updateProductQuantity = asyncHandler(async (req, res) => {
    const { quantity } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    // Check if user is the supplier of this product
    if (product.supplier.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this product');
    }

    if (quantity < 0) {
        res.status(400);
        throw new Error('Quantity cannot be negative');
    }

    // Update quantity and outOfStock status
    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
            quantity: quantity,
            outOfStock: quantity <= 0
        },
        { new: true }
    );

    res.status(200).json({
        success: true,
        message: 'Product quantity updated successfully',
        product: updatedProduct
    });
});

// Toggle product visibility - Admin only
export const toggleProductVisibility = asyncHandler(async (req, res) => {
    // Check if user is admin
    if (req.user.userType !== 'admin') {
        res.status(403);
        throw new Error('Only admins can manage product visibility');
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    product.isVisible = !product.isVisible;
    await product.save();

    res.status(200).json({
        success: true,
        message: `Product ${product.isVisible ? 'shown' : 'hidden'} in shop`,
        product
    });
}); 