import Recognition from '../models/Recognition.js';

// @desc    Get all active recognitions
// @route   GET /api/recognitions
// @access  Public
export const getAllRecognitions = async (req, res) => {
  try {
    const recognitions = await Recognition.find({ isActive: true })
      .sort({ order: 1 })
      .select('-__v');

    return res.status(200).json({
      success: true,
      count: recognitions.length,
      data: recognitions
    });
  } catch (error) {
    console.error('getAllRecognitions error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching recognitions'
    });
  }
};

// @desc    Get all recognitions (including inactive) - Admin only
// @route   GET /api/recognitions/admin/all
// @access  Private/Admin
export const getAllRecognitionsAdmin = async (req, res) => {
  try {
    const recognitions = await Recognition.find()
      .sort({ order: 1 })
      .select('-__v');

    return res.status(200).json({
      success: true,
      count: recognitions.length,
      data: recognitions
    });
  } catch (error) {
    console.error('getAllRecognitionsAdmin error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching recognitions'
    });
  }
};

// @desc    Get single recognition by ID
// @route   GET /api/recognitions/:id
// @access  Private/Admin
export const getRecognitionById = async (req, res) => {
  try {
    const recognition = await Recognition.findById(req.params.id).select('-__v');

    if (!recognition) {
      return res.status(404).json({
        success: false,
        message: 'Recognition not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: recognition
    });
  } catch (error) {
    console.error('getRecognitionById error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching recognition'
    });
  }
};

// @desc    Create new recognition
// @route   POST /api/recognitions
// @access  Private/Admin
export const createRecognition = async (req, res) => {
  try {
    const { name, logo, description, order, externalLink } = req.body;

    // Handle file upload or URL
    let logoPath = logo;
    if (req.file) {
      logoPath = `/uploads/recognitions/${req.file.filename}`;
    }

    // Validation
    if (!name || !logoPath) {
      return res.status(400).json({
        success: false,
        message: 'Name and logo are required'
      });
    }

    const recognition = new Recognition({
      name,
      logo: logoPath,
      description: description || '',
      order: order || 0,
      externalLink: externalLink || '',
      isActive: true
    });

    const savedRecognition = await recognition.save();

    return res.status(201).json({
      success: true,
      message: 'Recognition created successfully',
      data: savedRecognition
    });
  } catch (error) {
    console.error('createRecognition error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error creating recognition'
    });
  }
};

// @desc    Update recognition
// @route   PUT /api/recognitions/:id
// @access  Private/Admin
export const updateRecognition = async (req, res) => {
  try {
    const { name, logo, description, order, isActive, externalLink } = req.body;

    let recognition = await Recognition.findById(req.params.id);

    if (!recognition) {
      return res.status(404).json({
        success: false,
        message: 'Recognition not found'
      });
    }

    // Handle file upload or URL
    if (req.file) {
      recognition.logo = `/uploads/recognitions/${req.file.filename}`;
    } else if (logo !== undefined) {
      recognition.logo = logo;
    }

    // Update other fields
    if (name !== undefined) recognition.name = name;
    if (description !== undefined) recognition.description = description;
    if (order !== undefined) recognition.order = order;
    if (isActive !== undefined) recognition.isActive = isActive;
    if (externalLink !== undefined) recognition.externalLink = externalLink;

    const updatedRecognition = await recognition.save();

    return res.status(200).json({
      success: true,
      message: 'Recognition updated successfully',
      data: updatedRecognition
    });
  } catch (error) {
    console.error('updateRecognition error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating recognition'
    });
  }
};

// @desc    Delete recognition
// @route   DELETE /api/recognitions/:id
// @access  Private/Admin
export const deleteRecognition = async (req, res) => {
  try {
    const recognition = await Recognition.findByIdAndDelete(req.params.id);

    if (!recognition) {
      return res.status(404).json({
        success: false,
        message: 'Recognition not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Recognition deleted successfully',
      data: recognition
    });
  } catch (error) {
    console.error('deleteRecognition error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error deleting recognition'
    });
  }
};

// @desc    Bulk update order/status
// @route   PUT /api/recognitions/bulk/update
// @access  Private/Admin
export const bulkUpdateRecognitions = async (req, res) => {
  try {
    const { recognitions } = req.body;

    if (!Array.isArray(recognitions)) {
      return res.status(400).json({
        success: false,
        message: 'Recognitions array is required'
      });
    }

    const updatePromises = recognitions.map(rec =>
      Recognition.findByIdAndUpdate(rec._id, rec, { new: true })
    );

    const results = await Promise.all(updatePromises);

    return res.status(200).json({
      success: true,
      message: 'Recognitions updated successfully',
      data: results
    });
  } catch (error) {
    console.error('bulkUpdateRecognitions error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating recognitions'
    });
  }
};
