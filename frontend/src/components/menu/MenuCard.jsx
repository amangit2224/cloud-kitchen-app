import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { addFavorite, removeFavorite } from '../../services/favoriteService';
import Button from '../common/Button';
import toast from 'react-hot-toast';

/* ─── Guest Login Modal ──────────────────────────────────────── */
const GuestLoginModal = ({ item, onClose }) => {
  const overlayRef = useRef(null);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return createPortal(
    <div className="ck-guest-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="ck-guest-modal">

        <button className="ck-guest-close" onClick={onClose} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div className="ck-guest-icon">🛒</div>
        <h2 className="ck-guest-title">One step away!</h2>
        <p className="ck-guest-sub">Sign in to add items to your cart and place orders.</p>

        <div className="ck-guest-item-pill">
          <span className="ck-guest-item-emoji">
            {item.imageUrl
              ? <img src={item.imageUrl} alt={item.name} />
              : '🍽️'}
          </span>
          <div className="ck-guest-item-info">
            <span className="ck-guest-item-name">{item.name}</span>
            <span className="ck-guest-item-price">₹{item.price}</span>
          </div>
          <span className="ck-guest-item-tag">wants to join your cart</span>
        </div>

        <div className="ck-guest-actions">
          <Link to="/login?redirect=/menu" className="ck-guest-btn-primary" onClick={onClose}>
            Sign In
          </Link>
          <Link to="/register?redirect=/menu" className="ck-guest-btn-secondary" onClick={onClose}>
            Create Account — It's Free
          </Link>
        </div>

        <p className="ck-guest-note">
          Already ordered before?{' '}
          <Link to="/login?redirect=/menu" onClick={onClose}>Sign in here →</Link>
        </p>
      </div>

      <style>{`
        .ck-guest-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(28,25,23,0.72); backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 1.5rem;
          animation: overlayIn 0.18s ease;
        }
        @keyframes overlayIn { from{opacity:0} to{opacity:1} }

        .ck-guest-modal {
          background: white; border-radius: 24px; padding: 2.5rem 2rem;
          max-width: 420px; width: 100%; position: relative; text-align: center;
          box-shadow: 0 30px 80px rgba(0,0,0,0.28);
          animation: modalIn 0.28s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes modalIn {
          from{opacity:0;transform:scale(0.86) translateY(24px)}
          to  {opacity:1;transform:scale(1)   translateY(0)}
        }

        .ck-guest-close {
          position:absolute; top:1rem; right:1rem;
          width:32px; height:32px; border-radius:50%;
          background:var(--ink-05); border:none; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          color:var(--ink-50); transition:all 0.15s;
        }
        .ck-guest-close:hover { background:var(--ink-10); color:var(--ink); transform:scale(1.1); }

        .ck-guest-icon {
          font-size:3rem; margin-bottom:1rem; display:block;
          animation: iconBounce 0.55s cubic-bezier(0.34,1.56,0.64,1) 0.12s both;
        }
        @keyframes iconBounce {
          from{transform:scale(0.4) rotate(-15deg);opacity:0}
          to  {transform:scale(1)   rotate(0deg);  opacity:1}
        }

        .ck-guest-title {
          font-family:var(--font-display); font-size:1.6rem;
          color:var(--ink); margin-bottom:0.5rem;
        }
        .ck-guest-sub { color:var(--ink-50); font-size:0.9rem; line-height:1.6; margin-bottom:1.5rem; }

        .ck-guest-item-pill {
          background:var(--coral-bg); border:1.5px solid rgba(232,65,42,0.15);
          border-radius:14px; padding:0.85rem 1rem;
          display:flex; align-items:center; gap:0.75rem;
          margin-bottom:1.75rem; text-align:left;
        }
        .ck-guest-item-emoji {
          width:44px; height:44px; border-radius:10px; overflow:hidden;
          background:white; display:flex; align-items:center; justify-content:center;
          font-size:1.5rem; flex-shrink:0; box-shadow:0 2px 8px rgba(0,0,0,0.08);
        }
        .ck-guest-item-emoji img { width:100%; height:100%; object-fit:cover; }
        .ck-guest-item-info { display:flex; flex-direction:column; gap:0.15rem; flex:1; min-width:0; }
        .ck-guest-item-name {
          font-weight:700; font-size:0.9rem; color:var(--ink);
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
        .ck-guest-item-price { font-size:0.8rem; color:var(--coral); font-weight:600; }
        .ck-guest-item-tag { font-size:0.72rem; color:var(--ink-30); white-space:nowrap; font-style:italic; }

        .ck-guest-actions { display:flex; flex-direction:column; gap:0.65rem; margin-bottom:1.25rem; }
        .ck-guest-btn-primary {
          display:block; background:var(--coral); color:white;
          font-weight:700; font-size:0.95rem; padding:0.85rem 1.5rem;
          border-radius:var(--r-md); text-decoration:none; text-align:center;
          transition:all 0.2s; box-shadow:0 4px 14px rgba(232,65,42,0.35);
        }
        .ck-guest-btn-primary:hover {
          background:var(--coral-dark); transform:translateY(-1px);
          box-shadow:0 6px 20px rgba(232,65,42,0.45); color:white;
        }
        .ck-guest-btn-secondary {
          display:block; background:var(--ink-05); color:var(--ink);
          font-weight:600; font-size:0.9rem; padding:0.85rem 1.5rem;
          border-radius:var(--r-md); text-decoration:none; text-align:center;
          transition:all 0.2s; border:1.5px solid var(--ink-10);
        }
        .ck-guest-btn-secondary:hover {
          background:var(--ink-10); border-color:var(--ink-30);
          transform:translateY(-1px); color:var(--ink);
        }
        .ck-guest-note { font-size:0.8rem; color:var(--ink-30); margin:0; }
        .ck-guest-note a { color:var(--coral); font-weight:600; }
        .ck-guest-note a:hover { color:var(--coral-dark); }

        @media (max-width:480px) {
          .ck-guest-modal { padding:2rem 1.25rem; border-radius:20px; }
          .ck-guest-item-tag { display:none; }
        }
      `}</style>
    </div>,
    document.body
  );
};

/* ─── MenuCard ───────────────────────────────────────────────── */
const MenuCard = ({ item, isFavorited: initialFavorited, onFavoriteToggle }) => {
  const { addToCart, isInCart, getItemQuantity, increaseQuantity, decreaseQuantity } = useCart();
  const { isAuthenticated } = useAuth();
  const inCart  = isInCart(item.id);
  const quantity = getItemQuantity(item.id);

  const [isFavorited,    setIsFavorited]    = useState(initialFavorited || false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [showGuestModal,  setShowGuestModal]  = useState(false);

  useEffect(() => { setIsFavorited(initialFavorited || false); }, [initialFavorited]);

  /* Add to cart — intercepts guests */
  const handleAddToCart = () => {
    if (!isAuthenticated) { setShowGuestModal(true); return; }
    addToCart(item);
    toast.success(`${item.name} added to cart!`);
  };

  /* Qty controls */
  const handleIncrease = () => {
    if (!isAuthenticated) { setShowGuestModal(true); return; }
    increaseQuantity(item.id);
  };
  const handleDecrease = () => decreaseQuantity(item.id);

  /* Favourite toggle */
  const handleFavoriteToggle = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) { toast.error('Please login to save favourites'); return; }
    setFavoriteLoading(true);
    try {
      if (isFavorited) {
        await removeFavorite(item.id);
        setIsFavorited(false);
        toast.success('Removed from favourites');
      } else {
        await addFavorite(item.id);
        setIsFavorited(true);
        toast.success('Added to favourites! ❤️');
      }
      if (onFavoriteToggle) onFavoriteToggle();
    } catch (error) {
      toast.error(error.message || 'Failed to update favourites');
    } finally {
      setFavoriteLoading(false);
    }
  };

  return (
    <>
      {showGuestModal && (
        <GuestLoginModal item={item} onClose={() => setShowGuestModal(false)} />
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">

        {/* Image */}
        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          {item.imageUrl
            ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
            : <div className="text-6xl">🍽️</div>}

          {/* Favourite button */}
          <button
            onClick={handleFavoriteToggle}
            disabled={favoriteLoading}
            className="absolute top-3 left-3 bg-white p-2 rounded-full shadow-md hover:scale-110 transition-transform disabled:opacity-50"
          >
            {isFavorited ? (
              <svg className="w-6 h-6 text-red-500 fill-current" viewBox="0 0 20 20">
                <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
              </svg>
            ) : (
              <svg className="w-6 h-6 text-gray-400 hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            )}
          </button>

          {/* Category badge */}
          <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-xs font-semibold text-gray-700 shadow-md">
            {item.category}
          </div>

          {/* Out of stock overlay */}
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">{item.name}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10">
            {item.description || 'Delicious food item from our kitchen'}
          </p>

          {/* Price & prep time */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl font-bold text-primary-600">₹{item.price}</span>
            {item.preparationTime && (
              <div className="flex items-center text-gray-500 text-sm">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {item.preparationTime} min
              </div>
            )}
          </div>

          {/* Cart controls */}
          {item.isAvailable ? (
            inCart ? (
              <div className="flex items-center justify-between bg-primary-50 rounded-lg p-2">
                <button
                  onClick={handleDecrease}
                  className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-primary-600 hover:bg-primary-100 transition shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4"/>
                  </svg>
                </button>
                <span className="text-lg font-bold text-primary-600 px-4">{quantity}</span>
                <button
                  onClick={handleIncrease}
                  className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-primary-600 hover:bg-primary-100 transition shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                  </svg>
                </button>
              </div>
            ) : (
              <Button onClick={handleAddToCart} variant="primary" size="md" fullWidth>
                {isAuthenticated ? 'Add to Cart' : '🔒 Add to Cart'}
              </Button>
            )
          ) : (
            <Button variant="outline" size="md" fullWidth disabled>
              Out of Stock
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default MenuCard;