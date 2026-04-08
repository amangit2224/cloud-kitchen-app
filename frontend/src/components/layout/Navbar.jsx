import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Cart from '../../pages/Cart';

const CartIcon = ({ count, onClick }) => (
  <button onClick={onClick} className="ck-nav-cart">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
    {count > 0 && <span className="ck-cart-badge">{count > 9 ? '9+' : count}</span>}
  </button>
);

const NavLink = ({ to, children, onClick }) => {
  const { pathname } = useLocation();
  const active = pathname === to || (to !== '/' && pathname.startsWith(to));
  return (
    <Link to={to} onClick={onClick}
      className={`ck-nav-link ${active ? 'active' : ''}`}>
      {children}
    </Link>
  );
};

const UserMenu = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initial = user?.name?.charAt(0)?.toUpperCase() || '?';
  const roleColor = user?.role === 'admin' ? '#E8412A' : user?.role === 'rider' ? '#0369A1' : '#16A34A';

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} className="ck-avatar-btn">
        <span className="ck-avatar" style={{ background: roleColor }}>{initial}</span>
        <span className="ck-avatar-name">{user?.name?.split(' ')[0]}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', color: 'var(--ink-50)' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div className="ck-dropdown" onClick={() => setOpen(false)}>
          <div className="ck-dropdown-header">
            <p className="ck-dropdown-name">{user?.name}</p>
            <p className="ck-dropdown-role">{user?.email}</p>
            <span className="badge" style={{
              background: roleColor + '18', color: roleColor,
              fontSize: '0.68rem', marginTop: '0.25rem'
            }}>{user?.role}</span>
          </div>
          <div className="ck-dropdown-divider" />
          {user?.role === 'customer' && (
            <>
              <Link to="/profile" className="ck-dropdown-item">👤 My Profile</Link>  {/* 👈 ADD THIS */}
              <Link to="/orders" className="ck-dropdown-item">📦 My Orders</Link>
              <Link to="/favorites" className="ck-dropdown-item">❤️ Favourites</Link>
            </>
          )}
          {user?.role === 'admin' && (
            <>
              <Link to="/admin/dashboard" className="ck-dropdown-item">📊 Dashboard</Link>
              <Link to="/admin/orders" className="ck-dropdown-item">📋 Orders</Link>
              <Link to="/admin/menu" className="ck-dropdown-item">🍽️ Menu</Link>
              <Link to="/admin/riders" className="ck-dropdown-item">🛵 Riders</Link>
            </>
          )}
          {user?.role === 'rider' && (
            <>
              <Link to="/profile" className="ck-dropdown-item">👤 My Profile</Link>  {/* 👈 ADD THIS */}
              <Link to="/rider/dashboard" className="ck-dropdown-item">🛵 My Dashboard</Link>
            </>
          )}
          <div className="ck-dropdown-divider" />
          <button onClick={onLogout} className="ck-dropdown-item ck-dropdown-logout">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const { user, logout, isAdmin, isRider, isCustomer } = useAuth();
  const { cartItems = [] } = useCart() || {};
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setMobileOpen(false), [pathname]);

  const cartCount = cartItems?.reduce((sum, i) => sum + (i.quantity || 1), 0) || 0;

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <>
      <nav className="ck-nav">
        <div className="ck-nav-inner">
          {/* Logo */}
          <Link to="/" className="ck-logo">
            <span className="ck-logo-mark">CK</span>
            <span className="ck-logo-text">Cloud Kitchen</span>
          </Link>

          {/* Desktop nav links */}
          <div className="ck-nav-links">
            {/* Home - Only for customers and admins, NOT for riders */}
            {(isCustomer || isAdmin) && <NavLink to="/">Home</NavLink>}
            
            {/* Menu - Only for customers and admins */}
            {(isCustomer || isAdmin) && (
              <NavLink to={isAdmin ? '/admin/menu' : '/menu'}>Menu</NavLink>
            )}
            
            {/* Favourites - Only for customers */}
            {isCustomer && <NavLink to="/favorites">Favourites</NavLink>}
            
            {/* Orders - Only for customers */}
            {isCustomer && <NavLink to="/orders">Orders</NavLink>}
            
            {/* Admin links */}
            {isAdmin && (
              <>
                <NavLink to="/admin/dashboard">Dashboard</NavLink>
                <NavLink to="/admin/orders">Orders</NavLink>
                <NavLink to="/admin/riders">Riders</NavLink>
              </>
            )}
            
            {/* Rider links - Only Dashboard */}
            {isRider && <NavLink to="/rider/dashboard">Dashboard</NavLink>}
          </div>

          {/* Right side */}
          <div className="ck-nav-right">
            {!user ? (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
              </>
            ) : (
              <>
                {/* Cart - Only for customers */}
                {isCustomer && <CartIcon count={cartCount} onClick={() => setIsCartOpen(true)} />}
                <UserMenu user={user} onLogout={handleLogout} />
              </>
            )}

            {/* Mobile hamburger */}
            <button className="ck-hamburger" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
              <span className={`ck-ham-line ${mobileOpen ? 'open' : ''}`} />
              <span className={`ck-ham-line ${mobileOpen ? 'open' : ''}`} />
              <span className={`ck-ham-line ${mobileOpen ? 'open' : ''}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`ck-mobile-menu ${mobileOpen ? 'open' : ''}`}>
        {/* Home - Only for customers and admins */}
        {(isCustomer || isAdmin) && (
          <NavLink to="/" onClick={() => setMobileOpen(false)}>🏠 Home</NavLink>
        )}
        
        {/* Menu - Only for customers and admins */}
        {(isCustomer || isAdmin) && (
          <NavLink to={isAdmin ? '/admin/menu' : '/menu'} onClick={() => setMobileOpen(false)}>🍽️ Menu</NavLink>
        )}
        
        {/* Favourites - Only for customers */}
        {isCustomer && <NavLink to="/favorites" onClick={() => setMobileOpen(false)}>❤️ Favourites</NavLink>}
        
        {/* Orders - Only for customers */}
        {isCustomer && <NavLink to="/orders" onClick={() => setMobileOpen(false)}>📦 My Orders</NavLink>}
        
        {/* Admin links */}
        {isAdmin && (
          <>
            <NavLink to="/admin/dashboard" onClick={() => setMobileOpen(false)}>📊 Dashboard</NavLink>
            <NavLink to="/admin/orders" onClick={() => setMobileOpen(false)}>📋 Manage Orders</NavLink>
            <NavLink to="/admin/riders" onClick={() => setMobileOpen(false)}>🛵 Manage Riders</NavLink>
          </>
        )}
        
        {/* Rider links - Only Dashboard */}
        {isRider && <NavLink to="/rider/dashboard" onClick={() => setMobileOpen(false)}>🛵 My Dashboard</NavLink>}
        
        {/* Become a Rider - Show for non-logged in users and customers */}
        {!isRider && !user && (
          <Link to="/rider/register" onClick={() => setMobileOpen(false)}
            style={{ color: 'var(--info)', fontWeight: 600, padding: '0.75rem 1.25rem', display: 'block' }}>
            🛵 Become a Rider
          </Link>
        )}
        
        {!user && (
          <div style={{ padding: '0.75rem 1.25rem', display: 'flex', gap: '0.75rem' }}>
            <Link to="/login" className="btn btn-outline btn-sm" style={{ flex: 1 }}>Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-sm" style={{ flex: 1 }}>Sign Up</Link>
          </div>
        )}
        
        {user && (
          <button onClick={handleLogout} style={{ all: 'unset', padding: '0.75rem 1.25rem', color: 'var(--danger)', fontWeight: 600, cursor: 'pointer', display: 'block', width: '100%' }}>
            Sign Out
          </button>
        )}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && <div className="ck-mobile-overlay" onClick={() => setMobileOpen(false)} />}

      {/* Cart Drawer - Only for customers */}
      {isCustomer && <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />}

      <style>{`
        .ck-nav {
          position: sticky; top: 0; z-index: 100;
          height: var(--nav-h);
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--ink-10);
          box-shadow: var(--shadow-xs);
        }
        .ck-nav-inner {
          max-width: 1200px; margin: 0 auto;
          height: 100%; padding: 0 1.5rem;
          display: flex; align-items: center; gap: 2rem;
        }
        .ck-logo {
          display: flex; align-items: center; gap: 0.6rem;
          text-decoration: none; flex-shrink: 0;
        }
        .ck-logo-mark {
          width: 34px; height: 34px; border-radius: 10px;
          background: var(--coral); color: white;
          font-family: var(--font-display); font-size: 0.9rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 8px rgb(232 65 42 / 0.35);
        }
        .ck-logo-text {
          font-family: var(--font-display); font-size: 1.1rem; font-weight: 700;
          color: var(--ink);
        }
        .ck-nav-links { display: flex; align-items: center; gap: 0.25rem; flex: 1; }
        .ck-nav-link {
          padding: 0.45rem 0.875rem; border-radius: var(--r-md);
          font-size: 0.875rem; font-weight: 500; color: var(--ink-50);
          text-decoration: none; transition: all 0.15s ease;
        }
        .ck-nav-link:hover { color: var(--ink); background: var(--ink-05); }
        .ck-nav-link.active { color: var(--coral); background: var(--coral-bg); font-weight: 600; }
        .ck-nav-right { display: flex; align-items: center; gap: 0.5rem; margin-left: auto; }
        .ck-nav-cart {
          position: relative; width: 38px; height: 38px; border-radius: var(--r-md);
          display: flex; align-items: center; justify-content: center;
          color: var(--ink-50); text-decoration: none; transition: all 0.15s ease;
          background: none; border: none; cursor: pointer;
        }
        .ck-nav-cart:hover { background: var(--ink-05); color: var(--ink); }
        .ck-cart-badge {
          position: absolute; top: 4px; right: 4px;
          min-width: 16px; height: 16px; padding: 0 4px;
          background: var(--coral); color: white;
          font-size: 0.6rem; font-weight: 700; border-radius: var(--r-full);
          display: flex; align-items: center; justify-content: center;
          border: 1.5px solid white;
        }
        .ck-avatar-btn {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.35rem 0.75rem 0.35rem 0.35rem;
          border-radius: var(--r-full); border: 1.5px solid var(--ink-10);
          background: var(--white); cursor: pointer;
          transition: all 0.15s ease;
        }
        .ck-avatar-btn:hover { border-color: var(--ink-30); box-shadow: var(--shadow-sm); }
        .ck-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          color: white; font-size: 0.75rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }
        .ck-avatar-name { font-size: 0.85rem; font-weight: 600; color: var(--ink); }
        .ck-dropdown {
          position: absolute; top: calc(100% + 8px); right: 0;
          min-width: 220px; background: white;
          border-radius: var(--r-lg); border: 1px solid var(--ink-10);
          box-shadow: var(--shadow-xl); padding: 0.5rem 0;
          animation: fadeUp 0.15s ease;
        }
        .ck-dropdown-header { padding: 0.75rem 1rem 0.6rem; }
        .ck-dropdown-name { font-weight: 700; color: var(--ink); font-size: 0.9rem; }
        .ck-dropdown-role { font-size: 0.78rem; color: var(--ink-50); margin-top: 0.1rem; }
        .ck-dropdown-divider { height: 1px; background: var(--ink-10); margin: 0.35rem 0; }
        .ck-dropdown-item {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.55rem 1rem; font-size: 0.875rem; color: var(--ink-80);
          text-decoration: none; transition: background 0.1s ease; cursor: pointer;
          width: 100%; border: none; background: none; font-family: var(--font-body);
          text-align: left;
        }
        .ck-dropdown-item:hover { background: var(--ink-05); color: var(--ink); }
        .ck-dropdown-logout { color: var(--danger); }
        .ck-dropdown-logout:hover { background: var(--danger-bg); }

        /* Hamburger */
        .ck-hamburger {
          display: none; flex-direction: column; justify-content: center;
          gap: 5px; padding: 8px; cursor: pointer;
          background: none; border: none;
        }
        .ck-ham-line {
          display: block; width: 22px; height: 2px;
          background: var(--ink); border-radius: 2px;
          transition: all 0.25s ease; transform-origin: center;
        }
        .ck-ham-line.open:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .ck-ham-line.open:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .ck-ham-line.open:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        /* Mobile menu */
        .ck-mobile-menu {
          position: fixed; top: var(--nav-h); left: 0; right: 0;
          background: white; border-bottom: 1px solid var(--ink-10);
          box-shadow: var(--shadow-lg); z-index: 99;
          transform: translateY(-8px); opacity: 0; pointer-events: none;
          transition: all 0.2s ease; display: flex; flex-direction: column;
        }
        .ck-mobile-menu.open { transform: translateY(0); opacity: 1; pointer-events: auto; }
        .ck-mobile-overlay {
          position: fixed; inset: 0; top: var(--nav-h);
          background: rgba(0,0,0,0.2); z-index: 98;
          backdrop-filter: blur(2px);
        }

        @media (max-width: 768px) {
          .ck-nav-links { display: none; }
          .ck-hamburger { display: flex; }
          .ck-avatar-name { display: none; }
        }
        @media (min-width: 769px) {
          .ck-mobile-menu { display: none !important; }
          .ck-mobile-overlay { display: none !important; }
        }
      `}</style>
    </>
  );
};

export default Navbar;