import React from 'react';
import MenuCard from './MenuCard';
import Loader from '../common/Loader';

const MenuList = ({ items, loading }) => {
  if (loading) {
    return <Loader size="lg" />;
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🍽️</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">No items found</h3>
        <p className="text-gray-600">Try selecting a different category</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <MenuCard key={item.id} item={item} />
      ))}
    </div>
  );
};

export default MenuList;