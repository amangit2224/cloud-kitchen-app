import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Cart = ({ isOpen, onClose }) => {
  const { cartItems, removeFromCart, increaseQuantity, decreaseQuantity, updateSpecialInstructions, totalPrice, totalItems, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [expandedItem, setExpandedItem] = useState(null);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please login to place an order');
      onClose();
      navigate('/login');
      return;
    }
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${isOpen ? 'opacity-40 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={(e) => { e.stopPropagation(); onClose(); }}
      />

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-[var(--ink)]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Your Cart
            </h2>
            <p className="text-sm text-gray-400">{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-3">
            {cartItems.length > 0 && (
              <button onClick={() => { clearCart(); toast('Cart cleared'); }} className="text-xs text-red-400 hover:text-red-600">
                Clear all
              </button>
            )}
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <span className="text-6xl mb-4">🛒</span>
              <p className="text-lg font-semibold text-[var(--ink)]">Your cart is empty</p>
              <p className="text-sm text-gray-400 mt-1">Add some delicious items from the menu</p>
              <button onClick={() => { onClose(); navigate('/menu'); }} className="btn btn-primary mt-6">
                Browse Menu
              </button>
            </div>
          ) : (
            cartItems.map(item => (
              <div key={item.id} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  {/* Image */}
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                  )}

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <p className="font-semibold text-[var(--ink)] text-sm leading-tight">{item.name}</p>
                      <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-400 transition ml-2 flex-shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-[var(--coral)] font-bold text-sm mt-1">₹{parseFloat(item.price).toFixed(0)}</p>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 bg-white rounded-full px-2 py-1 shadow-sm">
                        <button onClick={() => decreaseQuantity(item.id)} className="w-6 h-6 rounded-full flex items-center justify-center text-[var(--coral)] hover:bg-red-50 transition font-bold text-lg leading-none">−</button>
                        <span className="w-5 text-center text-sm font-bold text-[var(--ink)]">{item.quantity}</span>
                        <button onClick={() => increaseQuantity(item.id)} className="w-6 h-6 rounded-full flex items-center justify-center text-[var(--coral)] hover:bg-red-50 transition font-bold text-lg leading-none">+</button>
                      </div>
                      <span className="text-sm font-semibold text-gray-600">₹{(parseFloat(item.price) * item.quantity).toFixed(0)}</span>
                    </div>

                    {/* Special Instructions toggle */}
                    <button
                      onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                      className="text-xs text-[var(--coral)] mt-2 flex items-center gap-1 hover:underline"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      {item.specialInstructions ? 'Edit instructions' : 'Add special instructions'}
                    </button>

                    {expandedItem === item.id && (
                      <textarea
                        className="mt-2 w-full text-xs border border-gray-200 rounded-lg p-2 resize-none focus:outline-none focus:border-[var(--coral)] transition"
                        rows={2}
                        placeholder="e.g. No onions, extra spicy, less oil..."
                        value={item.specialInstructions || ''}
                        onChange={e => updateSpecialInstructions(item.id, e.target.value)}
                        maxLength={120}
                      />
                    )}

                    {item.specialInstructions && expandedItem !== item.id && (
                      <p className="text-xs text-gray-400 mt-1 italic">📝 {item.specialInstructions}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-100 p-5 space-y-3 bg-white">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Delivery fee</span>
              <span className="text-green-600 font-medium">FREE</span>
            </div>
            <div className="flex justify-between font-bold text-[var(--ink)] text-lg pt-2 border-t border-gray-100">
              <span>Total</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>
            <button onClick={handleCheckout} className="btn btn-primary w-full text-base py-3">
              Proceed to Checkout →
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;