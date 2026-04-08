import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFavorites } from '../services/favoriteService';
import MenuCard from '../components/menu/MenuCard';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await getFavorites();
      setFavorites(response.data.favorites);
    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-8xl mb-6">❤️</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">No Favorites Yet</h2>
          <p className="text-gray-600 mb-8">Start adding items to your favorites!</p>
          <Link to="/menu">
            <Button variant="primary" size="lg">
              Browse Menu
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">My Favorites</h1>
            <p className="text-gray-600 mt-2">{favorites.length} favorite items</p>
          </div>
          <Link to="/menu">
            <Button variant="outline">
              Browse Menu
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((favorite) => (
            <MenuCard
              key={favorite.id}
              item={favorite.menuItem}
              isFavorited={true}
              onFavoriteToggle={fetchFavorites}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Favorites;