import React, { useState, useEffect } from 'react';
import { getAllMenuItems } from '../services/menuService';
import { getFavorites } from '../services/favoriteService';
import MenuCard from '../components/menu/MenuCard';
import CategoryFilter from '../components/menu/CategoryFilter';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [sortBy, setSortBy] = useState('name');
  const [maxPrepTime, setMaxPrepTime] = useState(60);
  const [favoritedItems, setFavoritedItems] = useState(new Set());
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { totalItems } = useCart();
  const { isAuthenticated, user } = useAuth();
  
  // Check if user is customer
  const isCustomer = user?.role === 'customer';

  useEffect(() => {
    fetchMenuItems();
    if (isAuthenticated) fetchFavorites();
  }, [isAuthenticated]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await getAllMenuItems();
      const items = response.data.menuItems;
      setMenuItems(items);
      setFilteredItems(items);
      const uniqueCategories = [...new Set(items.map(item => item.category))];
      setCategories(uniqueCategories);
      const maxPrice = Math.max(...items.map(item => item.price));
      setPriceRange([0, Math.ceil(maxPrice)]);
      setError('');
    } catch (err) {
      console.error('Error fetching menu:', err);
      setError('Failed to load menu items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await getFavorites();
      const favoriteIds = new Set(response.data.favorites.map(fav => fav.menuItemId));
      setFavoritedItems(favoriteIds);
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  };

  useEffect(() => {
    let result = [...menuItems];
    if (selectedCategory !== 'All') result = result.filter(item => item.category === selectedCategory);
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );
    }
    result = result.filter(item => item.price >= priceRange[0] && item.price <= priceRange[1]);
    result = result.filter(item => !item.preparationTime || item.preparationTime <= maxPrepTime);
    switch (sortBy) {
      case 'name':       result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'price-low':  result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'prep-time':  result.sort((a, b) => (a.preparationTime || 0) - (b.preparationTime || 0)); break;
      default: break;
    }
    setFilteredItems(result);
  }, [selectedCategory, menuItems, searchQuery, priceRange, sortBy, maxPrepTime]);

  const handleCategorySelect = (category) => setSelectedCategory(category);

  const clearFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    const maxPrice = Math.max(...menuItems.map(item => item.price));
    setPriceRange([0, Math.ceil(maxPrice)]);
    setMaxPrepTime(60);
    setSortBy('name');
  };

  const hasActiveFilters = selectedCategory !== 'All' || searchQuery || sortBy !== 'name';

  return (
    <div className="page page-wide fade-up">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="mn-header">
        <div>
          <h1>Our Menu</h1>
          <p style={{ color: 'var(--ink-50)', marginTop: '0.25rem', fontSize: '0.875rem' }}>
            Fresh ingredients, made to order, delivered fast
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {isAuthenticated && (
            <Link to="/favorites" className="btn btn-outline btn-sm">
              ❤️ Favourites
            </Link>
          )}
        </div>
      </div>

      {/* ── Search + Filter bar ─────────────────────────────────── */}
      <div className="mn-toolbar">
        <div className="mn-search-wrap">
          <svg className="mn-search-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search dishes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="mn-search-input"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="mn-search-clear">✕</button>
          )}
        </div>

        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="mn-select">
          <option value="name">Sort: A–Z</option>
          <option value="price-low">Price: Low → High</option>
          <option value="price-high">Price: High → Low</option>
          <option value="prep-time">Prep Time</option>
        </select>

        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={`btn btn-sm ${filtersOpen ? 'btn-primary' : 'btn-outline'}`}
        >
          ⚙️ Filters {hasActiveFilters && <span className="mn-filter-dot" />}
        </button>

        {hasActiveFilters && (
          <button onClick={clearFilters} className="btn btn-ghost btn-sm" style={{ color: 'var(--coral)' }}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* ── Advanced filters panel ──────────────────────────────── */}
      {filtersOpen && (
        <div className="card mn-filters-panel fade-up">
          <div className="mn-filters-grid">
            <div className="form-group">
              <label className="label">Max Price: <strong>₹{priceRange[1]}</strong></label>
              <input
                type="range" min="0"
                max={Math.max(...menuItems.map(item => item.price), 100)}
                value={priceRange[1]}
                onChange={e => setPriceRange([0, parseInt(e.target.value)])}
                className="mn-range"
              />
              <div className="mn-range-labels">
                <span>₹0</span>
                <span>₹{Math.max(...menuItems.map(i => i.price), 100)}</span>
              </div>
            </div>
            <div className="form-group">
              <label className="label">Max Prep Time: <strong>{maxPrepTime} min</strong></label>
              <input
                type="range" min="5" max="60" step="5"
                value={maxPrepTime}
                onChange={e => setMaxPrepTime(parseInt(e.target.value))}
                className="mn-range"
              />
              <div className="mn-range-labels"><span>5 min</span><span>60 min</span></div>
            </div>
          </div>
        </div>
      )}

      {/* ── Error ───────────────────────────────────────────────── */}
      {error && (
        <div className="card" style={{ borderColor: 'var(--danger)', background: 'var(--danger-bg)', color: 'var(--danger)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{error}</span>
          <button onClick={fetchMenuItems} className="btn btn-sm btn-danger">Retry</button>
        </div>
      )}

      {/* ── Category filter ─────────────────────────────────────── */}
      <div className="mn-category-wrap">
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
        />
      </div>

      {/* ── Results count ────────────────────────────────────────── */}
      {!loading && (
        <div className="mn-results-row">
          <span style={{ color: 'var(--ink-50)', fontSize: '0.875rem' }}>
            {filteredItems.length} dish{filteredItems.length !== 1 ? 'es' : ''}
            {searchQuery ? ` for "${searchQuery}"` : ''}
            {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
          </span>
        </div>
      )}

      {/* ── Grid ────────────────────────────────────────────────── */}
      {loading ? (
        <div className="mn-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="mn-skeleton">
              <div className="mn-skeleton-img" />
              <div className="mn-skeleton-body">
                <div className="mn-skeleton-line" style={{ width: '70%' }} />
                <div className="mn-skeleton-line" style={{ width: '50%' }} />
                <div className="mn-skeleton-line" style={{ width: '40%', height: '2rem', marginTop: '0.5rem' }} />
              </div>
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="empty" style={{ minHeight: '40vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="empty-icon">🔍</div>
          <div className="empty-title">No dishes found</div>
          <div className="empty-desc">Try adjusting your filters or search term</div>
          <button onClick={clearFilters} className="btn btn-outline" style={{ marginTop: '1rem' }}>Clear Filters</button>
        </div>
      ) : (
        <div className="mn-grid">
          {filteredItems.map(item => (
            <MenuCard
              key={item.id}
              item={item}
              isFavorited={favoritedItems.has(item.id)}
              onFavoriteToggle={fetchFavorites}
            />
          ))}
        </div>
      )}

      <style>{`
        .mn-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 1rem; margin-bottom: 1.75rem; flex-wrap: wrap;
        }
        .mn-toolbar {
          display: flex; align-items: center; gap: 0.65rem;
          flex-wrap: wrap; margin-bottom: 1.25rem;
        }
        .mn-search-wrap {
          flex: 1; min-width: 220px; position: relative;
          display: flex; align-items: center;
          background: var(--white); border: 1.5px solid var(--ink-10);
          border-radius: var(--r-full); overflow: hidden;
          box-shadow: var(--shadow-xs);
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .mn-search-wrap:focus-within {
          border-color: var(--coral);
          box-shadow: 0 0 0 3px rgb(232 65 42 / 0.1);
        }
        .mn-search-icon { position: absolute; left: 0.875rem; color: var(--ink-30); pointer-events: none; }
        .mn-search-input {
          width: 100%; padding: 0.6rem 2.5rem 0.6rem 2.5rem;
          border: none; outline: none; background: transparent;
          font-family: var(--font-body); font-size: 0.875rem; color: var(--ink);
        }
        .mn-search-clear {
          position: absolute; right: 0.75rem; background: none; border: none;
          cursor: pointer; color: var(--ink-30); font-size: 0.85rem; padding: 0.2rem;
        }
        .mn-search-clear:hover { color: var(--ink); }
        .mn-select {
          padding: 0.6rem 1rem; border: 1.5px solid var(--ink-10);
          border-radius: var(--r-full); background: var(--white);
          font-family: var(--font-body); font-size: 0.875rem; color: var(--ink-80);
          outline: none; cursor: pointer; transition: border-color 0.15s;
          box-shadow: var(--shadow-xs);
        }
        .mn-select:focus { border-color: var(--coral); }
        .mn-filter-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: white; display: inline-block; margin-left: 2px;
        }
        .mn-filters-panel { margin-bottom: 1.25rem; }
        .mn-filters-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem;
        }
        .mn-range { width: 100%; accent-color: var(--coral); cursor: pointer; }
        .mn-range-labels {
          display: flex; justify-content: space-between;
          font-size: 0.75rem; color: var(--ink-30); margin-top: 0.25rem;
        }
        .mn-category-wrap { margin-bottom: 1.25rem; overflow-x: auto; scrollbar-width: none; }
        .mn-category-wrap::-webkit-scrollbar { display: none; }
        .mn-results-row { margin-bottom: 1rem; }
        .mn-cart-badge {
          position: absolute; top: -6px; right: -6px;
          min-width: 17px; height: 17px; padding: 0 4px;
          background: white; color: var(--coral);
          font-size: 0.65rem; font-weight: 800; border-radius: var(--r-full);
          display: flex; align-items: center; justify-content: center;
          border: 1.5px solid var(--coral);
        }
        .mn-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
          gap: 1.25rem;
        }
        .mn-skeleton {
          background: var(--white); border-radius: var(--r-xl);
          border: 1px solid var(--ink-10); overflow: hidden;
          animation: mn-pulse 1.6s ease-in-out infinite;
        }
        @keyframes mn-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.55; } }
        .mn-skeleton-img { height: 180px; background: var(--ink-10); }
        .mn-skeleton-body { padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .mn-skeleton-line { height: 14px; background: var(--ink-10); border-radius: var(--r-sm); }
        @media (max-width: 640px) {
          .mn-grid { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
          .mn-toolbar { gap: 0.5rem; }
          .mn-select { font-size: 0.8rem; padding: 0.5rem 0.75rem; }
        }
      `}</style>
    </div>
  );
};

export default Menu;