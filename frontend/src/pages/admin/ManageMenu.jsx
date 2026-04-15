import React, { useState, useEffect, useRef } from 'react';
import { getAllMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '../../services/menuService';
import API from '../../services/api';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

// ── Image uploader component ────────────────────────────────────────────────
const ImageUploader = ({ currentUrl, onUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [preview,   setPreview]   = useState(currentUrl || '');
  const [urlInput,  setUrlInput]  = useState(currentUrl || '');
  const [mode,      setMode]      = useState('url'); // 'url' | 'file'
  const fileRef = useRef(null);
  const dropRef = useRef(null);
  const [dragging, setDragging]   = useState(false);

  useEffect(() => {
    setPreview(currentUrl || '');
    setUrlInput(currentUrl || '');
  }, [currentUrl]);

  const handleUrlChange = (e) => {
    setUrlInput(e.target.value);
    setPreview(e.target.value);
    onUploaded(e.target.value);
  };

  const doUpload = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return; }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await API.post('/upload/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const url = res.data.imageUrl;
      setPreview(url);
      setUrlInput(url);
      onUploaded(url);
      toast.success('Image uploaded!');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e) => doUpload(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) doUpload(file);
  };

  return (
    <div>
      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 0, marginBottom: '0.75rem', border: '1.5px solid var(--ink-10)', borderRadius: 'var(--r-md)', overflow: 'hidden', width: 'fit-content' }}>
        {['url', 'file'].map(m => (
          <button key={m} type="button" onClick={() => setMode(m)}
            style={{ padding: '0.35rem 1rem', fontSize: '0.78rem', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)',
              background: mode === m ? 'var(--coral)' : 'transparent',
              color:      mode === m ? 'white' : 'var(--ink-50)',
              transition: 'all 0.15s' }}>
            {m === 'url' ? '🔗 URL' : '📁 Upload'}
          </button>
        ))}
      </div>

      {mode === 'url' ? (
        <div>
          <input value={urlInput} onChange={handleUrlChange}
            placeholder="https://images.unsplash.com/..."
            className="input" />
          <p style={{ fontSize: '0.72rem', color: 'var(--ink-30)', marginTop: 4 }}>
            Paste any direct image URL — Unsplash, your CDN, etc.
          </p>
        </div>
      ) : (
        <div
          ref={dropRef}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && fileRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? 'var(--coral)' : 'var(--ink-10)'}`,
            borderRadius: 'var(--r-lg)', padding: '1.75rem 1rem',
            textAlign: 'center', cursor: uploading ? 'not-allowed' : 'pointer',
            background: dragging ? 'var(--coral-bg)' : 'var(--ink-05)',
            transition: 'all 0.2s',
          }}>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
            onChange={handleFileInput} style={{ display: 'none' }} />
          {uploading ? (
            <div>
              <div className="spinner" style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.82rem', color: 'var(--ink-50)' }}>Uploading...</p>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</div>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink-80)' }}>
                {dragging ? 'Drop it here!' : 'Drag & drop or click to browse'}
              </p>
              <p style={{ fontSize: '0.72rem', color: 'var(--ink-30)', marginTop: 4 }}>
                JPEG, PNG, WebP — max 5 MB
              </p>
            </div>
          )}
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div style={{ marginTop: '0.75rem', height: 140, borderRadius: 'var(--r-lg)', overflow: 'hidden', border: '1.5px solid var(--ink-10)', position: 'relative' }}>
          <img src={preview} alt="preview"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={e => { e.target.style.display = 'none'; }} />
          <button type="button"
            onClick={() => { setPreview(''); setUrlInput(''); onUploaded(''); }}
            style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

// ── ManageMenu ───────────────────────────────────────────────────────────────
const EMPTY_FORM = { name: '', description: '', price: '', category: 'Breakfast', imageUrl: '', preparationTime: '', isAvailable: true };

const ManageMenu = () => {
  const [menuItems,    setMenuItems]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showModal,    setShowModal]    = useState(false);
  const [editingItem,  setEditingItem]  = useState(null);
  const [formData,     setFormData]     = useState(EMPTY_FORM);
  const [errors,       setErrors]       = useState({});
  const [submitting,   setSubmitting]   = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories       = ['Breakfast','Lunch','Dinner','Sweets','Beverages','Snacks','Sides'];
  const filterCategories = ['All', ...categories];

  useEffect(() => { fetchMenuItems(); }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const res = await getAllMenuItems();
      setMenuItems(res.data.menuItems);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const filteredItems = activeCategory === 'All'
    ? menuItems
    : menuItems.filter(i => i.category === activeCategory);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const handleImageUploaded = (url) => {
    setFormData(p => ({ ...p, imageUrl: url }));
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = 'Name is required';
    if (!formData.price || parseFloat(formData.price) <= 0) e.price = 'Valid price required';
    if (!formData.category) e.category = 'Category is required';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      const payload = {
        name:            formData.name.trim(),
        description:     formData.description.trim() || null,
        price:           parseFloat(formData.price),
        category:        formData.category,
        imageUrl:        formData.imageUrl.trim() || null,
        preparationTime: formData.preparationTime ? parseInt(formData.preparationTime) : null,
        isAvailable:     formData.isAvailable,
      };
      if (editingItem) { await updateMenuItem(editingItem.id, payload); toast.success('Item updated!'); }
      else             { await createMenuItem(payload);                  toast.success('Item added!'); }
      await fetchMenuItems();
      closeModal();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save item');
    } finally { setSubmitting(false); }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name, description: item.description || '',
      price: item.price.toString(), category: item.category,
      imageUrl: item.imageUrl || '', preparationTime: item.preparationTime?.toString() || '',
      isAvailable: item.isAvailable,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this menu item?')) return;
    try { await deleteMenuItem(id); toast.success('Item deleted'); await fetchMenuItems(); }
    catch { toast.error('Failed to delete'); }
  };

  const closeModal = () => {
    setShowModal(false); setEditingItem(null);
    setFormData(EMPTY_FORM); setErrors({});
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="page page-wide">
      {/* Header */}
      <div className="mn-header">
        <div>
          <h1>Manage Menu</h1>
          <p style={{ color: 'var(--ink-50)', marginTop: '0.25rem', fontSize: '0.875rem' }}>
            {menuItems.length} items · Add, edit, or remove menu items
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">+ Add New Item</button>
      </div>

      {/* Category tabs */}
      <div className="mn-category-wrap">
        <div className="tabs" style={{ marginBottom: 0 }}>
          {filterCategories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`tab ${activeCategory === cat ? 'active' : ''}`}>
              {cat} {cat !== 'All' && <span style={{ fontSize: '0.7rem', marginLeft: 3 }}>({menuItems.filter(i => i.category === cat).length})</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="mn-results-row">
        <span style={{ color: 'var(--ink-50)', fontSize: '0.875rem' }}>
          {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Grid */}
      {filteredItems.length === 0 ? (
        <div className="empty" style={{ minHeight: '40vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="empty-icon">🍽️</div>
          <div className="empty-title">No items in this category</div>
          <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ marginTop: '1rem' }}>+ Add New Item</button>
        </div>
      ) : (
        <div className="mn-grid">
          {filteredItems.map(item => (
            <div key={item.id} className="card" style={{ overflow: 'hidden', padding: 0, display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', height: 180, background: 'var(--ink-05)' }}>
                {item.imageUrl
                  ? <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🍽️</div>
                }
                <div style={{ position: 'absolute', top: 10, right: 10, background: 'white', padding: '3px 10px', borderRadius: 'var(--r-full)', fontSize: '0.7rem', fontWeight: 600, color: 'var(--ink)', boxShadow: 'var(--shadow-sm)' }}>
                  {item.category}
                </div>
                {!item.isAvailable && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="badge" style={{ background: 'var(--danger)', color: 'white' }}>Out of Stock</span>
                  </div>
                )}
              </div>
              <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.4rem' }}>{item.name}</h3>
                <p style={{ color: 'var(--ink-50)', fontSize: '0.78rem', marginBottom: '0.75rem', lineHeight: 1.4, flex: 1 }}>
                  {item.description || 'No description'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--coral)' }}>₹{parseFloat(item.price).toFixed(0)}</span>
                  {item.preparationTime && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--ink-50)' }}>⏱️ {item.preparationTime} min</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEdit(item)} className="btn btn-outline" style={{ flex: 1, padding: '0.45rem', fontSize: '0.8rem' }}>Edit</button>
                  <button onClick={() => handleDelete(item.id)}
                    className="btn" style={{ flex: 1, padding: '0.45rem', fontSize: '0.8rem', background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid rgba(220,38,38,0.2)' }}
                    onMouseEnter={e => { e.target.style.background = 'var(--danger)'; e.target.style.color = 'white'; }}
                    onMouseLeave={e => { e.target.style.background = 'var(--danger-bg)'; e.target.style.color = 'var(--danger)'; }}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: 'var(--r-xl)', width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ padding: '1.75rem 2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--ink)', margin: 0 }}>
                  {editingItem ? 'Edit Menu Item' : 'Add New Item'}
                </h2>
                <button onClick={closeModal} style={{ background: 'var(--ink-05)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                <div>
                  <label className="label">Item Name *</label>
                  <input name="name" value={formData.name} onChange={handleChange}
                    placeholder="e.g., Masala Dosa" className="input"
                    style={{ borderColor: errors.name ? 'var(--danger)' : undefined }} />
                  {errors.name && <p style={{ color: 'var(--danger)', fontSize: '0.73rem', marginTop: 3 }}>{errors.name}</p>}
                </div>

                <div>
                  <label className="label">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange}
                    rows={2} placeholder="Describe the dish..." className="input" style={{ resize: 'vertical' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="label">Price (₹) *</label>
                    <input name="price" type="number" step="0.01" value={formData.price} onChange={handleChange}
                      placeholder="120" className="input"
                      style={{ borderColor: errors.price ? 'var(--danger)' : undefined }} />
                    {errors.price && <p style={{ color: 'var(--danger)', fontSize: '0.73rem', marginTop: 3 }}>{errors.price}</p>}
                  </div>
                  <div>
                    <label className="label">Category *</label>
                    <select name="category" value={formData.category} onChange={handleChange} className="input">
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* ── Image uploader ── */}
                <div>
                  <label className="label">Food Image (optional)</label>
                  <ImageUploader
                    currentUrl={formData.imageUrl}
                    onUploaded={handleImageUploaded}
                  />
                </div>

                <div>
                  <label className="label">Preparation Time (minutes)</label>
                  <input name="preparationTime" type="number" value={formData.preparationTime}
                    onChange={handleChange} placeholder="15" className="input" />
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                  <input type="checkbox" name="isAvailable" checked={formData.isAvailable} onChange={handleChange}
                    style={{ width: 16, height: 16, accentColor: 'var(--coral)', cursor: 'pointer' }} />
                  <span style={{ fontSize: '0.875rem', color: 'var(--ink-80)', fontWeight: 500 }}>Available for ordering</span>
                </label>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="submit" disabled={submitting} className="btn btn-primary"
                    style={{ flex: 1, padding: '0.7rem', fontSize: '0.95rem' }}>
                    {submitting ? 'Saving...' : editingItem ? 'Update Item' : 'Add Item'}
                  </button>
                  <button type="button" onClick={closeModal} className="btn btn-outline"
                    style={{ padding: '0.7rem 1.5rem' }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .mn-header { display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; margin-bottom:1.75rem; flex-wrap:wrap; }
        .mn-category-wrap { margin-bottom:1.25rem; overflow-x:auto; scrollbar-width:none; }
        .mn-category-wrap::-webkit-scrollbar { display:none; }
        .mn-results-row { margin-bottom:1rem; }
        .mn-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:1.5rem; }
        @media(max-width:640px) { .mn-grid { grid-template-columns:1fr; gap:1rem; } }
      `}</style>
    </div>
  );
};

export default ManageMenu;