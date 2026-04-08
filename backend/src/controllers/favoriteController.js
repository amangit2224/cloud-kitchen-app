const { Favorite, MenuItem } = require('../models');

// Add to favorites
const addFavorite = async (req, res) => {
  try {
    const { menuItemId } = req.body;
    const userId = req.user.id;

    if (!menuItemId) {
      return res.status(400).json({
        success: false,
        message: 'Menu item ID is required'
      });
    }

    // Check if menu item exists
    const menuItem = await MenuItem.findByPk(menuItemId);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Check if already favorited
    const existing = await Favorite.findOne({
      where: { userId, menuItemId }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Item already in favorites'
      });
    }

    // Add to favorites
    const favorite = await Favorite.create({
      userId,
      menuItemId
    });

    res.status(201).json({
      success: true,
      message: 'Added to favorites',
      data: { favorite }
    });

  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Remove from favorites
const removeFavorite = async (req, res) => {
  try {
    const { menuItemId } = req.params;
    const userId = req.user.id;

    const favorite = await Favorite.findOne({
      where: { userId, menuItemId }
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }

    await favorite.destroy();

    res.status(200).json({
      success: true,
      message: 'Removed from favorites'
    });

  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get user's favorites
const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const favorites = await Favorite.findAll({
      where: { userId },
      include: [
        {
          model: MenuItem,
          as: 'menuItem'
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: { favorites }
    });

  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Check if item is favorited
const checkFavorite = async (req, res) => {
  try {
    const { menuItemId } = req.params;
    const userId = req.user.id;

    const favorite = await Favorite.findOne({
      where: { userId, menuItemId }
    });

    res.status(200).json({
      success: true,
      data: { isFavorited: !!favorite }
    });

  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  addFavorite,
  removeFavorite,
  getFavorites,
  checkFavorite
};