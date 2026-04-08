import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { addFavorite, removeFavorite } from '../../services/favoriteService';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const MenuCard = ({ item, isFavorited: initialFavorited, onFavoriteToggle }) => {
  const { addToCart, isInCart, getItemQuantity, increaseQuantity, decreaseQuantity } = useCart();
  const { isAuthenticated } = useAuth();
  const inCart = isInCart(item.id);
  const quantity = getItemQuantity(item.id);
  
  const [isFavorited, setIsFavorited] = useState(initialFavorited || false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    setIsFavorited(initialFavorited || false);
  }, [initialFavorited]);

  const handleAddToCart = () => {
    addToCart(item);
    toast.success(`${item.name} added to cart!`);
  };

  const handleFavoriteToggle = async (e) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to add favorites');
      return;
    }

    setFavoriteLoading(true);

    try {
      if (isFavorited) {
        await removeFavorite(item.id);
        setIsFavorited(false);
        toast.success('Removed from favorites');
      } else {
        await addFavorite(item.id);
        setIsFavorited(true);
        toast.success('Added to favorites!');
      }
      
      if (onFavoriteToggle) {
        onFavoriteToggle();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update favorites');
    } finally {
      setFavoriteLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-6xl">🍽️</div>
        )}
        
        {/* Favorite Button */}
        <button
          onClick={handleFavoriteToggle}
          disabled={favoriteLoading}
          className="absolute top-3 left-3 bg-white p-2 rounded-full shadow-md hover:scale-110 transition-transform disabled:opacity-50"
        >
          {isFavorited ? (
            <svg className="w-6 h-6 text-red-500 fill-current" viewBox="0 0 20 20">
              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-gray-400 hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
        </button>

        {/* Category Badge */}
        <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-xs font-semibold text-gray-700 shadow-md">
          {item.category}
        </div>

        {/* Availability Badge */}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
          {item.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10">
          {item.description || 'Delicious food item from our kitchen'}
        </p>

        {/* Price and Prep Time */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-primary-600">
              ₹{item.price}
            </span>
          </div>
          {item.preparationTime && (
            <div className="flex items-center text-gray-500 text-sm">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {item.preparationTime} min
            </div>
          )}
        </div>

        {/* Add to Cart / Quantity Controls */}
        {item.isAvailable ? (
          inCart ? (
            <div className="flex items-center justify-between bg-primary-50 rounded-lg p-2">
              <button
                onClick={() => decreaseQuantity(item.id)}
                className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-primary-600 hover:bg-primary-100 transition shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              
              <span className="text-lg font-bold text-primary-600 px-4">
                {quantity}
              </span>
              
              <button
                onClick={() => increaseQuantity(item.id)}
                className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-primary-600 hover:bg-primary-100 transition shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          ) : (
            <Button
              onClick={handleAddToCart}
              variant="primary"
              size="md"
              fullWidth
            >
              Add to Cart
            </Button>
          )
        ) : (
          <Button
            variant="outline"
            size="md"
            fullWidth
            disabled
          >
            Out of Stock
          </Button>
        )}
      </div>
    </div>
  );
};

export default MenuCard;