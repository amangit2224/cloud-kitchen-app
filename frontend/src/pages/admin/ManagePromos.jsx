import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../../services/api';

const EMPTY_FORM = {
  code: '', description: '', discountType: 'percentage', discountValue: '',
  minOrderAmount: '', maxDiscountAmount: '', usageLimit: '', isActive: true, expiresAt: '',
};

const ManagePromos = () => {
  const [promos,    setPromos]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [saving,    setSaving]    = useState(false);

  const fetch = async () => {
    try {
      setLoading(true);
      const res = await API.get('/promo');
      setPromos(res.data?.data?.promos || []);
    } catch (e) { toast.error('Failed to load promo codes'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit   = (p) => {
    setEditing(p);
    setForm({
      code: p.code, description: p.description || '', discountType: p.discountType,
      discountValue: p.discountValue, minOrderAmount: p.minOrderAmount || '',
      maxDiscountAmount: p.maxDiscountAmount || '', usageLimit: p.usageLimit || '',
      isActive: p.isActive,
      expiresAt: p.expiresAt ? p.expiresAt.slice(0, 10) : '',
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async () => {
    if (!form.code.trim())      { toast.error('Code is required');    return; }
    if (!form.discountValue)    { toast.error('Value is required');   return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        code:             form.code.toUpperCase().trim(),
        discountValue:    parseFloat(form.discountValue),
        minOrderAmount:   form.minOrderAmount   ? parseFloat(form.minOrderAmount)   : 0,
        maxDiscountAmount:form.maxDiscountAmount? parseFloat(form.maxDiscountAmount): null,
        usageLimit:       form.usageLimit       ? parseInt(form.usageLimit)         : null,
        expiresAt:        form.expiresAt        ? form.expiresAt                    : null,
      };
      if (editing) {
        await API.put(`/promo/${editing.id}`, payload);
        toast.success('Promo code updated!');
      } else {
        await API.post('/promo', payload);
        toast.success('Promo code created!');
      }
      setShowModal(false);
      fetch();
    } catch (e) { toast.error(e.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleToggle = async (promo) => {
    try {
      await API.put(`/promo/${promo.id}`, { isActive: !promo.isActive });
      toast.success(`Promo ${promo.isActive ? 'deactivated' : 'activated'}`);
      fetch();
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this promo code?')) return;
    try {
      await API.delete(`/promo/${id}`);
      toast.success('Deleted');
      fetch();
    } catch { toast.error('Failed to delete'); }
  };

  const isExpired = (p) => p.expiresAt && new Date() > new Date(p.expiresAt);
  const isFull    = (p) => p.usageLimit !== null && p.usedCount >= p.usageLimit;

  return (
    <div className="page page-wide fade-up">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Promo Codes</h1>
          <p style={{ color: 'var(--ink-50)', fontSize: '0.875rem', marginTop: '0.2rem' }}>Create and manage discount codes for customers</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">+ Create Promo Code</button>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner" style={{ width: 32, height: 32, margin: '0 auto' }} /></div>
      ) : promos.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎟️</div>
          <h3>No promo codes yet</h3>
          <p style={{ color: 'var(--ink-50)', margin: '0.5rem 0 1.5rem' }}>Create your first discount code to offer deals to customers</p>
          <button onClick={openCreate} className="btn btn-primary">Create Promo Code</button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Code</th><th>Discount</th><th>Min Order</th>
                  <th>Usage</th><th>Expires</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {promos.map(p => {
                  const expired = isExpired(p);
                  const full    = isFull(p);
                  const statusLabel = !p.isActive ? 'Inactive' : expired ? 'Expired' : full ? 'Limit Reached' : 'Active';
                  const statusColor = !p.isActive ? 'var(--ink-30)' : expired || full ? 'var(--warning)' : 'var(--success)';
                  const statusBg    = !p.isActive ? 'var(--ink-05)' : expired || full ? 'var(--warning-bg)' : 'var(--success-bg)';

                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.95rem', letterSpacing: '0.05em', color: 'var(--coral)' }}>{p.code}</div>
                        {p.description && <div style={{ fontSize: '0.75rem', color: 'var(--ink-50)' }}>{p.description}</div>}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>
                          {p.discountType === 'percentage'
                            ? `${p.discountValue}%`
                            : `₹${parseFloat(p.discountValue).toFixed(0)}`}
                        </span>
                        {p.discountType === 'percentage' && p.maxDiscountAmount && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--ink-50)' }}>max ₹{p.maxDiscountAmount}</div>
                        )}
                      </td>
                      <td>₹{parseFloat(p.minOrderAmount || 0).toFixed(0)}</td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{p.usedCount}</span>
                        <span style={{ color: 'var(--ink-50)' }}>{p.usageLimit ? ` / ${p.usageLimit}` : ' / ∞'}</span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--ink-50)' }}>
                        {p.expiresAt ? new Date(p.expiresAt).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td>
                        <span style={{ background: statusBg, color: statusColor, padding: '0.2rem 0.6rem', borderRadius: 'var(--r-full)', fontSize: '0.72rem', fontWeight: 600 }}>
                          {statusLabel}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => openEdit(p)} className="btn btn-outline btn-sm">Edit</button>
                          <button onClick={() => handleToggle(p)} className="btn btn-secondary btn-sm">
                            {p.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="btn btn-danger btn-sm">✕</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>{editing ? 'Edit Promo Code' : 'Create Promo Code'}</h2>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm">✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="label">Code *</label>
                <input name="code" value={form.code} onChange={handleChange} placeholder="e.g. WELCOME20"
                  className="input" style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }} />
              </div>

              <div className="form-group">
                <label className="label">Description</label>
                <input name="description" value={form.description} onChange={handleChange} placeholder="e.g. Welcome discount for new users" className="input" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="label">Discount Type *</label>
                  <select name="discountType" value={form.discountType} onChange={handleChange} className="input">
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Discount Value *</label>
                  <input name="discountValue" type="number" value={form.discountValue} onChange={handleChange}
                    placeholder={form.discountType === 'percentage' ? 'e.g. 20' : 'e.g. 50'} className="input" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="label">Min Order Amount (₹)</label>
                  <input name="minOrderAmount" type="number" value={form.minOrderAmount} onChange={handleChange} placeholder="0" className="input" />
                </div>
                {form.discountType === 'percentage' && (
                  <div className="form-group">
                    <label className="label">Max Discount Cap (₹)</label>
                    <input name="maxDiscountAmount" type="number" value={form.maxDiscountAmount} onChange={handleChange} placeholder="Optional" className="input" />
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="label">Usage Limit</label>
                  <input name="usageLimit" type="number" value={form.usageLimit} onChange={handleChange} placeholder="Unlimited" className="input" />
                </div>
                <div className="form-group">
                  <label className="label">Expires At</label>
                  <input name="expiresAt" type="date" value={form.expiresAt} onChange={handleChange} className="input" />
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="w-4 h-4" />
                <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--ink-80)' }}>Active (customers can use this code)</span>
              </label>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-full">
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Code'}
                </button>
                <button onClick={() => setShowModal(false)} className="btn btn-outline" style={{ minWidth: 90 }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePromos;