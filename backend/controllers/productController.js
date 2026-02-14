import Product from '../models/Product.js';
import Category from '../models/Category.js';

// @desc    Get all products (Public)
// @route   GET /api/products/public
// @access  Public
export const getPublicProducts = async (req, res) => {
  try {
    const { category, search, sortBy, minPrice, maxPrice, page = 1, limit = 100 } = req.query;

    const query = { active: true, stock: { $ne: 'out_of_stock' } };

    // Handle category filtering including subcategories
    if (category && category !== 'all') {
      // Find the category by ID or name
      let categoryDoc;
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        // It's a valid ObjectId
        categoryDoc = await Category.findById(category);
      } else {
        // It's a category name
        categoryDoc = await Category.findOne({ name: { $regex: new RegExp(`^${category}$`, 'i') } });
      }
      
      if (categoryDoc) {
        // Find all subcategories of the selected category
        const subcategories = await Category.find({ parentCategory: categoryDoc._id }).select('_id');
        const subcategoryIds = subcategories.map(sub => sub._id.toString());
        
        // Include both the parent category and all its subcategories
        const categoryIds = [categoryDoc._id.toString(), ...subcategoryIds];
        
        // Also include the category name for backward compatibility
        query.$or = [
          { category: { $in: categoryIds } },
          { category: categoryDoc.name },
          { category: { $regex: new RegExp(`^${categoryDoc.name}$`, 'i') } }
        ];
      } else {
        // Try direct match by name as fallback
        query.category = { $regex: new RegExp(`^${category}$`, 'i') };
      }
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    let sortOptions = { createdAt: -1 };
    if (sortBy === 'price-low') sortOptions = { price: 1 };
    if (sortBy === 'price-high') sortOptions = { price: -1 };
    if (sortBy === 'popular') sortOptions = { isPopular: -1, createdAt: -1 };
    if (sortBy === 'new') sortOptions = { isNew: -1, createdAt: -1 };

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Product.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: products
    });
  } catch (error) {
    console.error('getPublicProducts error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching products'
    });
  }
};

// @desc    Get product by ID (Public)
// @route   GET /api/products/public/:id
// @access  Public
export const getPublicProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ 
      _id: req.params.id, 
      active: true 
    }).select('-__v');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('getPublicProductById error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching product'
    });
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Private/Admin
export const getAllProducts = async (req, res) => {
  try {
    const { category, stock, active, search, page = 1, limit = 100 } = req.query;

    const query = {};

    // Handle category filtering including subcategories
    if (category) {
      // Find the category by ID or name
      let categoryDoc;
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        // It's a valid ObjectId
        categoryDoc = await Category.findById(category);
      } else {
        // It's a category name
        categoryDoc = await Category.findOne({ name: { $regex: new RegExp(`^${category}$`, 'i') } });
      }
      
      if (categoryDoc) {
        const subcategories = await Category.find({ parentCategory: categoryDoc._id }).select('_id');
        const subcategoryIds = subcategories.map(sub => sub._id.toString());
        const categoryIds = [categoryDoc._id.toString(), ...subcategoryIds];
        
        // Also include the category name for backward compatibility
        query.$or = [
          { category: { $in: categoryIds } },
          { category: categoryDoc.name },
          { category: { $regex: new RegExp(`^${categoryDoc.name}$`, 'i') } }
        ];
      } else {
        // Try direct match by name as fallback
        query.category = { $regex: new RegExp(`^${category}$`, 'i') };
      }
    }
    if (stock) query.stock = stock;
    if (active !== undefined) query.active = active === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { productId: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: products
    });
  } catch (error) {
    console.error('getAllProducts error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching products'
    });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Private/Admin
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('getProductById error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching product'
    });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const { 
      name, image, category, price, originalPrice, commission, resellerEarning, 
      stock, active, description, stockQuantity, images, features, isNew, isPopular,
      brand, tags, weight, dimensions, type, mfgDate, lifespan, sizes, colors
    } = req.body;

    // Generate unique product ID
    let productId;
    let productNumber = 1;
    let isUnique = false;
    
    // Find the highest existing product number
    const allProducts = await Product.find({}, { productId: 1 }).sort({ productId: -1 });
    
    if (allProducts.length > 0) {
      // Extract all product numbers and find the maximum
      const productNumbers = allProducts
        .map(p => {
          const match = p.productId.match(/^PRD(\d+)$/);
          return match ? parseInt(match[1]) : 0;
        })
        .filter(num => num > 0);
      
      if (productNumbers.length > 0) {
        productNumber = Math.max(...productNumbers) + 1;
      }
    }
    
    // Try to create a unique ID, increment if collision occurs
    while (!isUnique) {
      productId = `PRD${String(productNumber).padStart(3, '0')}`;
      const existing = await Product.findOne({ productId });
      if (!existing) {
        isUnique = true;
      } else {
        productNumber++;
      }
    }

    // Handle uploaded files
    let productImage = image || '📦';
    let uploadedImages = [];
    
    if (req.files) {
      if (req.files.image && req.files.image.length > 0) {
        productImage = `/uploads/products/${req.files.image[0].filename}`;
      }
      if (req.files.images && req.files.images.length > 0) {
        uploadedImages = req.files.images.map(file => `/uploads/products/${file.filename}`);
      }
    } else if (req.file) {
      productImage = `/uploads/products/${req.file.filename}`;
    }

    // Parse arrays if they come as strings
    let parsedImages = images || [];
    let parsedFeatures = features || [];
    let parsedTags = tags || [];
    let parsedSizes = sizes || [];
    let parsedColors = colors || [];

    if (typeof images === 'string') {
      try {
        parsedImages = JSON.parse(images);
      } catch (e) {
        parsedImages = [];
      }
    }
    
    if (typeof features === 'string') {
      try {
        parsedFeatures = JSON.parse(features);
      } catch (e) {
        parsedFeatures = [];
      }
    }

    if (typeof tags === 'string') {
      try {
        parsedTags = JSON.parse(tags);
      } catch (e) {
        parsedTags = [];
      }
    }

    if (typeof sizes === 'string') {
      try {
        parsedSizes = JSON.parse(sizes);
      } catch (e) {
        parsedSizes = [];
      }
    }

    if (typeof colors === 'string') {
      try {
        parsedColors = JSON.parse(colors);
      } catch (e) {
        parsedColors = [];
      }
    }

    // Merge uploaded images with existing images array
    if (uploadedImages.length > 0) {
      parsedImages = [...parsedImages, ...uploadedImages];
    }

    const product = await Product.create({
      productId,
      name,
      image: productImage,
      category,
      price,
      originalPrice: originalPrice || price,
      commission,
      resellerEarning: resellerEarning || commission,
      stock: stock || 'in_stock',
      active: active !== undefined ? active : true,
      description,
      stockQuantity: stockQuantity || 0,
      images: parsedImages,
      features: parsedFeatures,
      brand: brand || "Wooh's",
      tags: parsedTags,
      weight: weight || '1 kg',
      dimensions: dimensions || '25 × 15 × 10 cm',
      type: type || 'Organic',
      mfgDate: mfgDate || 'Jun 4, 2021',
      lifespan: lifespan || '30 days',
      isNew: isNew || false,
      isPopular: isPopular || false,
      sizes: parsedSizes,
      colors: parsedColors
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('createProduct error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error creating product'
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const { 
      name, image, category, price, originalPrice, commission, resellerEarning,
      stock, active, description, stockQuantity, images, features, isNew, isPopular,
      brand, tags, weight, dimensions, type, mfgDate, lifespan, sizes, colors
    } = req.body;

    product.name = name || product.name;
    
    // Handle uploaded files
    if (req.files) {
      if (req.files.image && req.files.image.length > 0) {
        product.image = `/uploads/products/${req.files.image[0].filename}`;
      }
      if (req.files.images && req.files.images.length > 0) {
        const uploadedImages = req.files.images.map(file => `/uploads/products/${file.filename}`);
        product.images = [...(product.images || []), ...uploadedImages];
      }
    } else if (req.file) {
      product.image = `/uploads/products/${req.file.filename}`;
    } else if (image) {
      product.image = image;
    }

    // Parse arrays if they come as strings
    let parsedImages = images;
    let parsedFeatures = features;
    let parsedTags = tags;
    let parsedSizes = sizes;
    let parsedColors = colors;

    if (typeof images === 'string') {
      try {
        parsedImages = JSON.parse(images);
      } catch (e) {
        parsedImages = undefined;
      }
    }
    
    if (typeof features === 'string') {
      try {
        parsedFeatures = JSON.parse(features);
      } catch (e) {
        parsedFeatures = undefined;
      }
    }

    if (typeof tags === 'string') {
      try {
        parsedTags = JSON.parse(tags);
      } catch (e) {
        parsedTags = undefined;
      }
    }

    if (typeof sizes === 'string') {
      try {
        parsedSizes = JSON.parse(sizes);
      } catch (e) {
        parsedSizes = undefined;
      }
    }

    if (typeof colors === 'string') {
      try {
        parsedColors = JSON.parse(colors);
      } catch (e) {
        parsedColors = undefined;
      }
    }
    
    product.category = category || product.category;
    product.price = price !== undefined ? price : product.price;
    if (originalPrice !== undefined) product.originalPrice = originalPrice;
    product.commission = commission !== undefined ? commission : product.commission;
    if (resellerEarning !== undefined) product.resellerEarning = resellerEarning;
    product.stock = stock || product.stock;
    product.active = active !== undefined ? active : product.active;
    product.description = description !== undefined ? description : product.description;
    product.stockQuantity = stockQuantity !== undefined ? stockQuantity : product.stockQuantity;
    if (parsedImages !== undefined) product.images = parsedImages;
    if (parsedFeatures !== undefined) product.features = parsedFeatures;
    if (brand !== undefined) product.brand = brand;
    if (parsedTags !== undefined) product.tags = parsedTags;
    if (weight !== undefined) product.weight = weight;
    if (dimensions !== undefined) product.dimensions = dimensions;
    if (type !== undefined) product.type = type;
    if (mfgDate !== undefined) product.mfgDate = mfgDate;
    if (lifespan !== undefined) product.lifespan = lifespan;
    if (isNew !== undefined) product.isNew = isNew;
    if (isPopular !== undefined) product.isPopular = isPopular;
    if (parsedSizes !== undefined) product.sizes = parsedSizes;
    if (parsedColors !== undefined) product.colors = parsedColors;

    const updatedProduct = await product.save();

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    console.error('updateProduct error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating product'
    });
  }
};

// @desc    Toggle product active status
// @route   PATCH /api/products/:id/toggle
// @access  Private/Admin
export const toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product.active = !product.active;
    const updatedProduct = await product.save();

    return res.status(200).json({
      success: true,
      message: `Product ${updatedProduct.active ? 'activated' : 'deactivated'} successfully`,
      data: updatedProduct
    });
  } catch (error) {
    console.error('toggleProductStatus error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error toggling product status'
    });
  }
};

// @desc    Update product stock
// @route   PATCH /api/products/:id/stock
// @access  Private/Admin
export const updateProductStock = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const { stock, stockQuantity } = req.body;

    if (stock) product.stock = stock;
    if (stockQuantity !== undefined) product.stockQuantity = stockQuantity;

    const updatedProduct = await product.save();

    return res.status(200).json({
      success: true,
      message: 'Product stock updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    console.error('updateProductStock error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating product stock'
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await product.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: {}
    });
  } catch (error) {
    console.error('deleteProduct error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error deleting product'
    });
  }
};

// @desc    Get product statistics
// @route   GET /api/products/stats
// @access  Private/Admin
export const getProductStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ active: true });
    const inactiveProducts = await Product.countDocuments({ active: false });
    const inStock = await Product.countDocuments({ stock: 'in_stock' });
    const lowStock = await Product.countDocuments({ stock: 'low_stock' });
    const outOfStock = await Product.countDocuments({ stock: 'out_of_stock' });

    // Get category counts
    const categoryStats = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalProducts,
        activeProducts,
        inactiveProducts,
        inStock,
        lowStock,
        outOfStock,
        categoryStats
      }
    });
  } catch (error) {
    console.error('getProductStats error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching product statistics'
    });
  }
};
