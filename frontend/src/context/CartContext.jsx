import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item) => {
    setCartItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1, specialInstructions: '' }];
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(i => i.id !== itemId));
  };

  const increaseQuantity = (itemId) => {
    setCartItems(prev =>
      prev.map(i => i.id === itemId ? { ...i, quantity: i.quantity + 1 } : i)
    );
  };

  const decreaseQuantity = (itemId) => {
    setCartItems(prev => {
      const item = prev.find(i => i.id === itemId);
      if (item && item.quantity <= 1) return prev.filter(i => i.id !== itemId);
      return prev.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
    });
  };

  // ── NEW: Update special instructions for a cart item ──────────────────
  const updateSpecialInstructions = (itemId, instructions) => {
    setCartItems(prev =>
      prev.map(i => i.id === itemId ? { ...i, specialInstructions: instructions } : i)
    );
  };

  const clearCart = () => setCartItems([]);

  const isInCart = (itemId) => cartItems.some(i => i.id === itemId);
  const getItemQuantity = (itemId) => cartItems.find(i => i.id === itemId)?.quantity || 0;

  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cartItems.reduce((sum, i) => sum + (parseFloat(i.price) * i.quantity), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      updateSpecialInstructions,
      clearCart,
      isInCart,
      getItemQuantity,
      totalItems,
      totalPrice,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);