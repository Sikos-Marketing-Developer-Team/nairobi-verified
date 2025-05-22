const Category = require('../models/Category');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for category image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/categories';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'category-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and WebP images are allowed.'));
    }
  }
});

// Helper function to create slug from name
const createSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

// Create a new category
const createCategory = async (req, res) => {
  try {
    const { name, description, icon, parent, featured, order, status } = req.body;
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Only administrators can create categories' 
      });
    }
    
    // Check if category with same name already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ 
        success: false,
        message: 'A category with this name already exists' 
      });
    }
    
    // Create slug from name
    const slug = createSlug(name);
    
    // Create new category
    const category = new Category({
      name,
      description,
      icon: icon || '📦',
      slug,
      parent: parent || null,
      featured: featured === 'true',
      order: order || 0,
      status: status || 'active'
    });
    
    // Add image if uploaded
    if (req.file) {
      category.image = req.file.path;
    }
    
    await category.save();
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating category',
      error: error.message 
    });
  }
};

// Get all categories
const getCategories = async (req, res) => {
  try {
    const { featured, status = 'active', parent } = req.query;
    
    // Build query
    const query = {};
    
    if (status) query.status = status;
    if (featured) query.featured = featured === 'true';
    if (parent === 'null') {
      query.parent = null;
    } else if (parent) {
      query.parent = parent;
    }
    
    // Get categories
    const categories = await Category.find(query)
      .sort({ order: 1, name: 1 })
      .populate('parent', 'name slug');
    
    res.status(200).json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching categories',
      error: error.message 
    });
  }
};

// Get a single category by ID or slug
const getCategory = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Check if identifier is ObjectId or slug
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
    
    let category;
    if (isObjectId) {
      category = await Category.findById(identifier);
    } else {
      category = await Category.findOne({ slug: identifier });
    }
    
    if (!category) {
      return res.status(404).json({ 
        success: false,
        message: 'Category not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      category
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching category',
      error: error.message 
    });
  }
};

// Update a category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, parent, featured, order, status } = req.body;
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Only administrators can update categories' 
      });
    }
    
    // Find category
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ 
        success: false,
        message: 'Category not found' 
      });
    }
    
    // Check if new name conflicts with existing category
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ name, _id: { $ne: id } });
      if (existingCategory) {
        return res.status(400).json({ 
          success: false,
          message: 'A category with this name already exists' 
        });
      }
      
      // Update slug if name changes
      category.slug = createSlug(name);
    }
    
    // Update fields
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (icon) category.icon = icon;
    if (parent !== undefined) category.parent = parent === 'null' ? null : parent;
    if (featured !== undefined) category.featured = featured === 'true';
    if (order !== undefined) category.order = order;
    if (status) category.status = status;
    
    // Update image if uploaded
    if (req.file) {
      category.image = req.file.path;
    }
    
    await category.save();
    
    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating category',
      error: error.message 
    });
  }
};

// Delete a category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Only administrators can delete categories' 
      });
    }
    
    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ 
        success: false,
        message: 'Category not found' 
      });
    }
    
    // Check if category has subcategories
    const hasSubcategories = await Category.exists({ parent: id });
    if (hasSubcategories) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot delete category with subcategories. Please delete or reassign subcategories first.' 
      });
    }
    
    // Delete category
    await Category.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting category',
      error: error.message 
    });
  }
};

// Get featured categories
const getFeaturedCategories = async (req, res) => {
  try {
    const featuredCategories = await Category.find({ 
      featured: true,
      status: 'active'
    }).sort({ order: 1 });
    
    res.status(200).json({
      success: true,
      count: featuredCategories.length,
      categories: featuredCategories
    });
  } catch (error) {
    console.error('Get featured categories error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching featured categories',
      error: error.message 
    });
  }
};

module.exports = {
  upload,
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  getFeaturedCategories
};