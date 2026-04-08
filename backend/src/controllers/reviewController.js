const { Review, Order, User, RiderProfile } = require('../models');

// Create review
const createReview = async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;
    const userId = req.user.id;

    // Validation
    if (!orderId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and rating are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if order exists and belongs to user
    const order = await Order.findOne({
      where: { id: orderId, userId }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order is delivered
    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'You can only review delivered orders'
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      where: { orderId }
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this order'
      });
    }

    // Create review
    const review = await Review.create({
      orderId,
      userId,
      rating,
      comment: comment || null
    });

    // ─── UPDATE RIDER RATING ───────────────────────────────────────────
    // Get the rider who delivered this order
    if (order.riderId) {
      const riderProfile = await RiderProfile.findOne({
        where: { userId: order.riderId }
      });

      if (riderProfile) {
        // Calculate new average rating
        const currentTotalRatings = riderProfile.totalRatings || 0;
        const currentRating = parseFloat(riderProfile.rating) || 5;
        
        // New average = (current total sum + new rating) / (current count + 1)
        const currentTotalSum = currentRating * currentTotalRatings;
        const newTotalSum = currentTotalSum + rating;
        const newTotalRatings = currentTotalRatings + 1;
        const newAverageRating = newTotalSum / newTotalRatings;
        
        // Update rider profile
        await riderProfile.update({
          rating: newAverageRating,
          totalRatings: newTotalRatings
        });
        
        console.log(`✅ Rider ${order.riderId} rating updated: ${newAverageRating.toFixed(2)} (${newTotalRatings} ratings)`);
      } else {
        console.log(`❌ Rider profile NOT found for user_id: ${order.riderId}`);
      }
    } else {
      console.log('⚠️ No rider assigned to this order');
    }

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: { review }
    });

  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get reviews for an order
const getOrderReview = async (req, res) => {
  try {
    const { orderId } = req.params;

    const review = await Review.findOne({
      where: { orderId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: { review }
    });

  } catch (error) {
    console.error('Get order review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get all reviews (admin)
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'totalAmount', 'status']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      data: { 
        reviews,
        totalReviews: reviews.length,
        averageRating: parseFloat(averageRating)
      }
    });

  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete review (admin only)
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Get the order to find rider
    const order = await Order.findOne({
      where: { id: review.orderId }
    });

    // Remove the rating from rider's profile
    if (order && order.riderId) {
      const riderProfile = await RiderProfile.findOne({
        where: { userId: order.riderId }
      });

      if (riderProfile && riderProfile.totalRatings > 0) {
        // Recalculate rating without this review
        const currentTotalRatings = riderProfile.totalRatings;
        const currentRating = parseFloat(riderProfile.rating) || 5;
        const currentTotalSum = currentRating * currentTotalRatings;
        const newTotalSum = currentTotalSum - review.rating;
        const newTotalRatings = currentTotalRatings - 1;
        
        let newAverageRating = 5;
        if (newTotalRatings > 0) {
          newAverageRating = newTotalSum / newTotalRatings;
        }
        
        await riderProfile.update({
          rating: newAverageRating,
          totalRatings: newTotalRatings
        });
        
        console.log(`✅ Rider ${order.riderId} rating updated after deletion`);
      }
    }

    await review.destroy();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  createReview,
  getOrderReview,
  getAllReviews,
  deleteReview
};