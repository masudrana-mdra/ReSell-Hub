const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/categories
// @desc    Get all categories (public)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    
    // Refresh product counts dynamically to keep statistics solid
    const updatedCategories = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({ category: cat.name, status: 'available' });
        if (cat.productCount !== count) {
          cat.productCount = count;
          await cat.save();
        }
        return cat;
      })
    );

    res.json({ success: true, categories: updatedCategories });
  } catch (error) {
    console.error('Fetch categories error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching categories' });
  }
});

// @route   POST /api/categories
// @desc    Create a category (Admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  const { name, image, description } = req.body;

  try {
    if (!name || !image || !description) {
      return res.status(400).json({ success: false, message: 'Please provide category name, image, and description' });
    }

    let category = await Category.findOne({ name });
    if (category) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    category = new Category({
      name,
      image,
      description
    });

    await category.save();
    res.status(201).json({ success: true, category, message: 'Category created successfully' });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ success: false, message: 'Server error creating category' });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update a category (Admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  const { name, image, description } = req.body;

  try {
    let category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const oldName = category.name;

    category.name = name || category.name;
    category.image = image || category.image;
    category.description = description || category.description;

    await category.save();

    // If category name changed, update all products categorized under it
    if (name && oldName !== name) {
      await Product.updateMany({ category: oldName }, { category: name });
    }

    res.json({ success: true, category, message: 'Category updated successfully' });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ success: false, message: 'Server error updating category' });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete a category (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting category' });
  }
});

module.exports = router;
