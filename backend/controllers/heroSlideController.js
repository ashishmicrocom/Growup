import HeroSlide from '../models/HeroSlide.js';

// @desc    Get all active hero slides
// @route   GET /api/hero-slides
// @access  Public
export const getAllHeroSlides = async (req, res) => {
  try {
    const slides = await HeroSlide.find({ isActive: true })
      .sort({ order: 1 })
      .select('-__v');

    return res.status(200).json({
      success: true,
      count: slides.length,
      data: slides
    });
  } catch (error) {
    console.error('getAllHeroSlides error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching hero slides'
    });
  }
};

// @desc    Get all hero slides (including inactive) - Admin only
// @route   GET /api/hero-slides/all
// @access  Private/Admin
export const getAllHeroSlidesAdmin = async (req, res) => {
  try {
    const slides = await HeroSlide.find()
      .sort({ order: 1 })
      .select('-__v');

    return res.status(200).json({
      success: true,
      count: slides.length,
      data: slides
    });
  } catch (error) {
    console.error('getAllHeroSlidesAdmin error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching hero slides'
    });
  }
};

// @desc    Get single hero slide by ID
// @route   GET /api/hero-slides/:id
// @access  Private/Admin
export const getHeroSlideById = async (req, res) => {
  try {
    const slide = await HeroSlide.findById(req.params.id).select('-__v');

    if (!slide) {
      return res.status(404).json({
        success: false,
        message: 'Hero slide not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: slide
    });
  } catch (error) {
    console.error('getHeroSlideById error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching hero slide'
    });
  }
};

// @desc    Create new hero slide
// @route   POST /api/hero-slides
// @access  Private/Admin
export const createHeroSlide = async (req, res) => {
  try {
    const { subtitle, text, description, image, ctaButtons, features, order, contentAlignment, isActive } = req.body;

    const slide = await HeroSlide.create({
      subtitle: subtitle || '',
      text,
      description,
      image,
      ctaButtons: ctaButtons || [],
      features: features || [],
      order: order || 0,
      contentAlignment: contentAlignment || 'right',
      isActive: isActive !== undefined ? isActive : true
    });

    return res.status(201).json({
      success: true,
      message: 'Hero slide created successfully',
      data: slide
    });
  } catch (error) {
    console.error('createHeroSlide error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error creating hero slide'
    });
  }
};

// @desc    Update hero slide
// @route   PUT /api/hero-slides/:id
// @access  Private/Admin
export const updateHeroSlide = async (req, res) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);

    if (!slide) {
      return res.status(404).json({
        success: false,
        message: 'Hero slide not found'
      });
    }

    const { subtitle, text, description, image, ctaButtons, features, order, contentAlignment, isActive } = req.body;

    if (subtitle !== undefined) slide.subtitle = subtitle;
    if (text !== undefined) slide.text = text;
    if (description !== undefined) slide.description = description;
    if (image !== undefined) slide.image = image;
    if (ctaButtons !== undefined) slide.ctaButtons = ctaButtons;
    if (features !== undefined) slide.features = features;
    if (order !== undefined) slide.order = order;
    if (contentAlignment !== undefined) slide.contentAlignment = contentAlignment;
    if (isActive !== undefined) slide.isActive = isActive;

    const updatedSlide = await slide.save();

    return res.status(200).json({
      success: true,
      message: 'Hero slide updated successfully',
      data: updatedSlide
    });
  } catch (error) {
    console.error('updateHeroSlide error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating hero slide'
    });
  }
};

// @desc    Delete hero slide
// @route   DELETE /api/hero-slides/:id
// @access  Private/Admin
export const deleteHeroSlide = async (req, res) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);

    if (!slide) {
      return res.status(404).json({
        success: false,
        message: 'Hero slide not found'
      });
    }

    await slide.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Hero slide deleted successfully',
      data: {}
    });
  } catch (error) {
    console.error('deleteHeroSlide error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error deleting hero slide'
    });
  }
};

// @desc    Toggle hero slide active status
// @route   PATCH /api/hero-slides/:id/toggle
// @access  Private/Admin
export const toggleHeroSlideStatus = async (req, res) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);

    if (!slide) {
      return res.status(404).json({
        success: false,
        message: 'Hero slide not found'
      });
    }

    slide.isActive = !slide.isActive;
    const updatedSlide = await slide.save();

    return res.status(200).json({
      success: true,
      message: `Hero slide ${updatedSlide.isActive ? 'activated' : 'deactivated'} successfully`,
      data: updatedSlide
    });
  } catch (error) {
    console.error('toggleHeroSlideStatus error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error toggling hero slide status'
    });
  }
};
