import Category from '../models/Category.js';

// @desc    Get all categories (Public)
// @route   GET /api/categories/public
// @access  Public
export const getPublicCategories = async (req, res) => {
  try {
    const categories = await Category.find({ active: true })
      .populate('parentCategory', 'name icon')
      .select('name icon parentCategory')
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('getPublicCategories error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching categories'
    });
  }
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private/Admin
export const getAllCategories = async (req, res) => {
  try {
    const { search, active, parentOnly } = req.query;

    const query = {};
    if (active !== undefined) query.active = active === 'true';
    if (parentOnly === 'true') query.parentCategory = null;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const categories = await Category.find(query)
      .populate('parentCategory', 'name icon')
      .populate('subcategories')
      .sort({ name: 1 })
      .select('-__v');

    const total = await Category.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: categories.length,
      total,
      data: categories
    });
  } catch (error) {
    console.error('getAllCategories error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching categories'
    });
  }
};

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Private/Admin
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).select('-__v');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('getCategoryById error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching category'
    });
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
  try {
    const { name, description, icon, active, parentCategory } = req.body;

    // Check if category already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    // Validate parent category if provided
    if (parentCategory) {
      const parentExists = await Category.findById(parentCategory);
      if (!parentExists) {
        return res.status(400).json({
          success: false,
          message: 'Parent category not found'
        });
      }
    }

    const category = await Category.create({
      name,
      description,
      icon: icon || '📦',
      active: active !== undefined ? active : true,
      parentCategory: parentCategory || null
    });

    await category.populate('parentCategory', 'name icon');

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    console.error('createCategory error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || 'Error creating category'
    });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res) => {
  try {
    const { name, description, icon, active, parentCategory } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if new name already exists (excluding current category)
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id }
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }
    }

    // Validate parent category if provided
    if (parentCategory !== undefined) {
      if (parentCategory) {
        // Prevent setting self as parent
        if (parentCategory === req.params.id) {
          return res.status(400).json({
            success: false,
            message: 'Category cannot be its own parent'
          });
        }
        const parentExists = await Category.findById(parentCategory);
        if (!parentExists) {
          return res.status(400).json({
            success: false,
            message: 'Parent category not found'
          });
        }
      }
      category.parentCategory = parentCategory || null;
    }

    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;
    if (icon !== undefined) category.icon = icon;
    if (active !== undefined) category.active = active;

    await category.save();
    await category.populate('parentCategory', 'name icon');

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    console.error('updateCategory error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating category'
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if any products are using this category
    const Product = (await import('../models/Product.js')).default;
    const productsCount = await Product.countDocuments({ category: category.name });

    if (productsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. ${productsCount} product(s) are using this category.`
      });
    }

    // Check if any subcategories exist
    const subcategoriesCount = await Category.countDocuments({ parentCategory: req.params.id });

    if (subcategoriesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. ${subcategoriesCount} subcategory(ies) exist under this category.`
      });
    }

    await category.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('deleteCategory error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error deleting category'
    });
  }
};

// @desc    Toggle category status
// @route   PATCH /api/categories/:id/toggle-status
// @access  Private/Admin
export const toggleCategoryStatus = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    category.active = !category.active;
    await category.save();

    return res.status(200).json({
      success: true,
      message: `Category ${category.active ? 'activated' : 'deactivated'} successfully`,
      data: category
    });
  } catch (error) {
    console.error('toggleCategoryStatus error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error toggling category status'
    });
  }
};
