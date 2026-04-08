import React, { useState, useEffect } from 'react';
import { getAllMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '../../services/menuService';
import Loader from '../../components/common/Loader';

const ManageMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Breakfast',
    imageUrl: '',
    preparationTime: '',
    isAvailable: true
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['Breakfast', 'Lunch', 'Dinner', 'Sweets', 'Beverages', 'Snacks', 'Sides'];
  const filterCategories = ['All', ...categories];

  useEffect(() => { fetchMenuItems(); }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await getAllMenuItems();
      setMenuItems(response.data.menuItems);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = activeCategory === 'All'
    ? menuItems
    : menuItems.filter(i => i.category === activeCategory);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newVal = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: newVal }));
    if (name === 'imageUrl') setPreviewUrl(value);
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = 'Name is required';
    if (!formData.price || parseFloat(formData.price) <= 0) e.price = 'Valid price is required';
    if (!formData.category) e.category = 'Category is required';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setSubmitting(true);
    try {
      const itemData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        category: formData.category,
        imageUrl: formData.imageUrl.trim() || null,
        preparationTime: formData.preparationTime ? parseInt(formData.preparationTime) : null,
        isAvailable: formData.isAvailable
      };
      if (editingItem) {
        await updateMenuItem(editingItem.id, itemData);
      } else {
        await createMenuItem(itemData);
      }
      await fetchMenuItems();
      closeModal();
    } catch (error) {
      alert(`Failed to save: ${error.response?.data?.message || error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setPreviewUrl(item.imageUrl || '');
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category: item.category,
      imageUrl: item.imageUrl || '',
      preparationTime: item.preparationTime?.toString() || '',
      isAvailable: item.isAvailable
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await deleteMenuItem(id);
      await fetchMenuItems();
    } catch {
      alert('Failed to delete menu item');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setPreviewUrl('');
    setFormData({ name: '', description: '', price: '', category: 'Breakfast', imageUrl: '', preparationTime: '', isAvailable: true });
    setErrors({});
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="page page-wide">
      {/* Header - matches Menu page structure */}
      <div className="mn-header">
        <div>
          <h1>Manage Menu</h1>
          <p style={{ color: 'var(--ink-50)', marginTop: '0.25rem', fontSize: '0.875rem' }}>
            Add, edit, or delete menu items
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          + Add New Item
        </button>
      </div>

      {/* Category Tabs - using same styling as Menu page */}
      <div className="mn-category-wrap">
        <div className="tabs" style={{ marginBottom: 0, borderBottom: '1px solid var(--ink-10)' }}>
          {filterCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`tab ${activeCategory === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Count - matches Menu page */}
      <div className="mn-results-row">
        <span style={{ color: 'var(--ink-50)', fontSize: '0.875rem' }}>
          {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Grid - using mn-grid class to match Menu page exactly */}
      {filteredItems.length === 0 ? (
        <div className="empty" style={{ minHeight: '40vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="empty-icon">🍽️</div>
          <div className="empty-title">No items in this category</div>
          <div className="empty-desc">Click "Add New Item" to create your first menu item</div>
          <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ marginTop: '1rem' }}>+ Add New Item</button>
        </div>
      ) : (
        <div className="mn-grid">
          {filteredItems.map(item => (
            <div key={item.id} className="card" style={{ overflow: 'hidden', padding: 0, display: 'flex', flexDirection: 'column' }}>
              {/* Image */}
              <div style={{ position: 'relative', height: 180, background: 'var(--ink-05)' }}>
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🍽️</div>
                )}
                {/* Category badge */}
                <div style={{
                  position: 'absolute', top: 10, right: 10,
                  background: 'white', padding: '4px 10px',
                  borderRadius: 'var(--r-full)', fontSize: '0.7rem', fontWeight: 600,
                  color: 'var(--ink)', boxShadow: 'var(--shadow-sm)'
                }}>
                  {item.category}
                </div>
                {/* Unavailable overlay */}
                {!item.isAvailable && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <span className="badge" style={{ background: 'var(--danger)', color: 'white', padding: '4px 12px' }}>
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.5rem' }}>
                  {item.name}
                </h3>
                <p style={{ color: 'var(--ink-50)', fontSize: '0.8rem', marginBottom: '1rem', lineHeight: 1.4, flex: 1 }}>
                  {item.description || 'No description available'}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--coral)' }}>
                    ₹{parseFloat(item.price).toFixed(0)}
                  </span>
                  {item.preparationTime && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--ink-50)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      {item.preparationTime} min
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleEdit(item)}
                    className="btn btn-outline"
                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="btn btn-danger"
                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger)' }}
                    onMouseEnter={e => { e.target.style.background = 'var(--danger)'; e.target.style.color = 'white'; }}
                    onMouseLeave={e => { e.target.style.background = 'var(--danger-bg)'; e.target.style.color = 'var(--danger)'; }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal - keep as is, it's already styled well */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: 'var(--r-xl)', width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ padding: '1.75rem 2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)' }}>
                  {editingItem ? 'Edit Menu Item' : 'Add New Item'}
                </h2>
                <button onClick={closeModal} style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {previewUrl && (
                  <div style={{ width: '100%', height: 160, borderRadius: 'var(--r-lg)', overflow: 'hidden', border: '1.5px solid var(--ink-10)' }}>
                    <img src={previewUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                  </div>
                )}

                <div>
                  <label className="label">Item Name *</label>
                  <input name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Masala Dosa" className="input" style={{ borderColor: errors.name && 'var(--danger)' }} />
                  {errors.name && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: 3 }}>{errors.name}</p>}
                </div>

                <div>
                  <label className="label">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="Describe the dish..." className="input" style={{ resize: 'vertical' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="label">Price (₹) *</label>
                    <input name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} placeholder="120" className="input" style={{ borderColor: errors.price && 'var(--danger)' }} />
                    {errors.price && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: 3 }}>{errors.price}</p>}
                  </div>
                  <div>
                    <label className="label">Category *</label>
                    <select name="category" value={formData.category} onChange={handleChange} className="input">
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Image URL (optional)</label>
                  <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://images.unsplash.com/..." className="input" />
                  <p style={{ fontSize: '0.73rem', color: 'var(--ink-50)', marginTop: 4 }}>Paste an Unsplash or any direct image URL — preview shows above</p>
                </div>

                <div>
                  <label className="label">Preparation Time (minutes)</label>
                  <input name="preparationTime" type="number" value={formData.preparationTime} onChange={handleChange} placeholder="15" className="input" />
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                  <input type="checkbox" name="isAvailable" checked={formData.isAvailable} onChange={handleChange} style={{ width: 16, height: 16, accentColor: 'var(--coral)', cursor: 'pointer' }} />
                  <span style={{ fontSize: '0.875rem', color: 'var(--ink-80)', fontWeight: 500 }}>Available for ordering</span>
                </label>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="submit" disabled={submitting} className="btn btn-primary" style={{ flex: 1, padding: '0.65rem', fontSize: '0.95rem', opacity: submitting ? 0.6 : 1 }}>
                    {submitting ? 'Saving...' : (editingItem ? 'Update Item' : 'Add Item')}
                  </button>
                  <button type="button" onClick={closeModal} className="btn btn-outline" style={{ padding: '0.65rem 1.5rem', fontSize: '0.95rem' }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .mn-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.75rem;
          flex-wrap: wrap;
        }
        .mn-category-wrap {
          margin-bottom: 1.25rem;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .mn-category-wrap::-webkit-scrollbar {
          display: none;
        }
        .mn-results-row {
          margin-bottom: 1rem;
        }
        .mn-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }
        @media (max-width: 640px) {
          .mn-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ManageMenu;