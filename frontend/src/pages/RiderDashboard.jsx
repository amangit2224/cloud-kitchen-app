import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  getRiderProfile, toggleAvailability, getAvailableOrders,
  getActiveOrder, acceptOrder, markPickedUp, markDelivered, getDeliveryHistory,
} from '../services/riderService';

const VEHICLE_ICON = { bicycle: '🚲', motorcycle: '🛵', car: '🚗' };

// ── Pending screen ────────────────────────────────────────────────────────────
const PendingScreen = () => (
  <div className="page page-sm" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
    <div style={{ textAlign: 'center' }} className="fade-up">
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⏳</div>
      <h2>Application Under Review</h2>
      <p style={{ color: 'var(--ink-50)', marginTop: '0.75rem', maxWidth: 360 }}>
        Your application is being reviewed by our team. You'll be able to start delivering once approved — usually within 24 hours.
      </p>
      <div className="card" style={{ marginTop: '2rem', textAlign: 'left' }}>
        {[['📋','Application submitted',true],['🔍','Admin review in progress',true],['✅','Account activation',false],['🛵','Start delivering!',false]].map(([icon,text,done]) => (
          <div key={text} style={{ display:'flex', gap:'0.75rem', padding:'0.6rem 0', borderBottom:'1px solid var(--ink-05)', alignItems:'center' }}>
            <span>{icon}</span>
            <span style={{ color: done ? 'var(--ink)' : 'var(--ink-30)', fontSize: '0.9rem', fontWeight: done ? 600 : 400 }}>{text}</span>
            {done && <span style={{ marginLeft: 'auto', color: 'var(--success)', fontSize: '0.8rem' }}>✓</span>}
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ── Rejected screen ───────────────────────────────────────────────────────────
const RejectedScreen = () => (
  <div className="page page-sm" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
    <div style={{ textAlign: 'center' }} className="fade-up">
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😞</div>
      <h2>Application Not Approved</h2>
      <p style={{ color: 'var(--ink-50)', marginTop: '0.75rem' }}>Your rider application was not approved. Please contact support for more information.</p>
    </div>
  </div>
);

// ── Active Delivery Card ──────────────────────────────────────────────────────
const ActiveDeliveryCard = ({ order, onPickedUp, onDelivered }) => {
  const [loading, setLoading] = useState('');
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.deliveryAddress || '')}`;

  const handle = async (action, fn) => {
    setLoading(action);
    try { await fn(); } finally { setLoading(''); }
  };

  return (
    <div className="ck-active-card fade-up">
      <div className="ck-active-card-header">
        <div>
          <div className="ck-active-badge">🛵 Active Delivery</div>
          <h3 style={{ marginTop: '0.5rem' }}>Order #{order.id}</h3>
        </div>
        <div className="ck-earning-pill">
          +₹{parseFloat(order.earningAmount || (parseFloat(order.totalAmount || 0) * 0.10)).toFixed(2)}
        </div>
      </div>

      {/* Customer */}
      <div className="ck-active-section">
        <div className="ck-active-section-label">Customer</div>
        <div className="ck-customer-row">
          <div className="ck-customer-avatar">{order.customer?.name?.charAt(0) || '?'}</div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{order.customer?.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--ink-50)' }}>
              {order.items?.length || 0} item(s) · ₹{parseFloat(order.totalAmount || 0).toFixed(2)}
            </div>
          </div>
          {order.customer?.phone && (
            <a href={`tel:${order.customer.phone}`} className="btn btn-outline btn-sm" style={{ marginLeft: 'auto' }}>📞 Call</a>
          )}
        </div>
      </div>

      {/* Address */}
      <div className="ck-active-section">
        <div className="ck-active-section-label">Delivery Address</div>
        <div className="ck-address-box">
          <span>📍 {order.deliveryAddress}</span>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm" style={{ background: '#1a73e8', color: 'white', flexShrink: 0 }}>Maps →</a>
        </div>
      </div>

      {/* Items */}
      <div className="ck-active-section">
        <div className="ck-active-section-label">Items</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {order.items?.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--ink-80)' }}>× {item.quantity} {item.menuItem?.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: '1rem 1.5rem' }}>
        {order.status === 'ready' && (
          <button onClick={() => handle('pickup', onPickedUp)} disabled={loading === 'pickup'} className="btn btn-primary btn-full btn-lg">
            {loading === 'pickup' ? <span className="spinner" /> : "✓ I've Picked Up the Order"}
          </button>
        )}
        {order.status === 'out_for_delivery' && (
          <button onClick={() => handle('deliver', onDelivered)} disabled={loading === 'deliver'} className="btn btn-success btn-full btn-lg">
            {loading === 'deliver' ? <span className="spinner" /> : '🎉 Mark as Delivered'}
          </button>
        )}
      </div>
    </div>
  );
};

// ── Available Order Card ──────────────────────────────────────────────────────
const AvailableOrderCard = ({ order, onAccept }) => {
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    try { await onAccept(order.id); } finally { setLoading(false); }
  };
  return (
    <div className="ck-avail-card">
      <div className="ck-avail-card-top">
        <div>
          <div style={{ fontWeight: 700, color: 'var(--ink)' }}>Order #{order.id}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--ink-50)', marginTop: '0.15rem' }}>
            {order.items?.length || 0} item(s) · {order.customer?.name}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 700, color: 'var(--success)', fontSize: '1.05rem' }}>+₹{order.estimatedEarning}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--ink-50)' }}>your cut</div>
        </div>
      </div>
      <div style={{ fontSize: '0.82rem', color: 'var(--ink-80)', display: 'flex', alignItems: 'flex-start', gap: '0.35rem', margin: '0.5rem 0' }}>
        <span>📍</span><span>{order.deliveryAddress}</span>
      </div>
      <button onClick={handle} disabled={loading} className="btn btn-primary btn-full">
        {loading ? <span className="spinner" /> : 'Accept Delivery'}
      </button>
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
const RiderDashboard = () => {
  const [profile, setProfile]         = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [available, setAvailable]     = useState([]);
  const [history, setHistory]         = useState([]);
  const [tab, setTab]                 = useState('dashboard');
  const [loading, setLoading]         = useState(true);
  const [toggling, setToggling]       = useState(false);

  const fetchProfile = useCallback(async () => {
    try { 
      const res = await getRiderProfile(); 
      // Handle both response structures: { data: { profile } } or { profile }
      setProfile(res?.data?.profile || res?.profile || null); 
    } catch (err) { 
      console.error('Profile fetch error:', err);
    }
  }, []);

  const fetchActiveOrder = useCallback(async () => {
    try { 
      const res = await getActiveOrder(); 
      // Handle both response structures
      setActiveOrder(res?.data?.activeOrder || res?.activeOrder || null); 
    } catch { 
      setActiveOrder(null); 
    }
  }, []);

  const fetchAvailable = useCallback(async () => {
    try { 
      const res = await getAvailableOrders(); 
      // Handle both response structures
      const orders = res?.data?.orders || res?.orders || [];
      setAvailable(orders); 
    } catch { 
      setAvailable([]); 
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try { 
      const res = await getDeliveryHistory(); 
      // Handle both response structures
      const deliveries = res?.data?.deliveries || res?.deliveries || [];
      setHistory(deliveries); 
    } catch { 
      setHistory([]); 
    }
  }, []);

  const fetchAll = useCallback(async () => {
    await Promise.all([fetchProfile(), fetchActiveOrder(), fetchAvailable()]);
    setLoading(false);
  }, [fetchProfile, fetchActiveOrder, fetchAvailable]);

  useEffect(() => { fetchAll(); const t = setInterval(fetchAll, 15000); return () => clearInterval(t); }, [fetchAll]);
  useEffect(() => { if (tab === 'history') fetchHistory(); }, [tab, fetchHistory]);

  const handleToggle = async () => {
    setToggling(true);
    try { 
      const res = await toggleAvailability(); 
      toast.success(res?.message || res?.data?.message || 'Status updated'); 
      await fetchProfile();
    } catch (err) { 
      toast.error(err?.message || 'Failed to update status'); 
    } finally { 
      setToggling(false); 
    }
  };

  const handleAccept = async (orderId) => {
    try { 
      await acceptOrder(orderId); 
      toast.success('Order accepted!'); 
      await fetchAll(); 
    } catch (err) { 
      toast.error(err?.message || 'Failed to accept order'); 
    }
  };

  const handlePickedUp = async () => {
    try { 
      await markPickedUp(); 
      toast.success('Marked as picked up!'); 
      await fetchAll(); 
    } catch (err) { 
      toast.error(err?.message || 'Failed to update'); 
    }
  };

  const handleDelivered = async () => {
    try {
      const res = await markDelivered();
      toast.success(`Delivery complete! You earned ₹${res?.earning || res?.data?.earning || '0'}`);
      await fetchAll();
    } catch (err) { 
      toast.error(err?.message || 'Failed to mark delivered'); 
    }
  };

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
      <div style={{ textAlign: 'center' }}><div className="spinner" style={{ width: 32, height: 32 }} /><p style={{ marginTop: '1rem', color: 'var(--ink-50)' }}>Loading...</p></div>
    </div>
  );

  if (!profile) return <div className="page"><p>Profile not found.</p></div>;
  if (profile.approvalStatus === 'pending')  return <PendingScreen />;
  if (profile.approvalStatus === 'rejected') return <RejectedScreen />;

  return (
    <div className="page fade-up">
      {/* Hero */}
      <div className="ck-rider-hero">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="ck-rider-hero-avatar">{VEHICLE_ICON[profile.vehicleType] || '🛵'}</div>
          <div>
            <h2 style={{ color: 'white', marginBottom: '0.15rem' }}>{profile.user?.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', textTransform: 'capitalize' }}>{profile.vehicleType}</span>
              <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem' }}>⭐ {parseFloat(profile.rating || 5).toFixed(1)}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
            {profile.currentOrderId ? '🚚 On delivery' : (profile.isAvailable ? '🟢 Online' : '⚪ Offline')}
          </span>
          <button onClick={handleToggle} disabled={toggling || !!profile.currentOrderId}
            className={`ck-toggle-btn ${profile.isAvailable ? 'online' : 'offline'}`}>
            {toggling ? '...' : profile.isAvailable ? 'Go Offline' : 'Go Online'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4 fade-up fade-up-1" style={{ marginBottom: '2rem' }}>
        {[
          { icon: '💰', label: "Today's Earnings", value: `₹${parseFloat(profile.todayEarnings || 0).toFixed(2)}`,  color: 'var(--success)', bg: 'var(--success-bg)' },
          { icon: '📦', label: 'Total Deliveries', value: profile.totalDeliveries || 0,                              color: 'var(--coral)',   bg: 'var(--coral-bg)' },
          { icon: '⭐', label: 'Rating',            value: `${parseFloat(profile.rating || 5).toFixed(1)}/5`,        color: '#D97706',       bg: '#FFFBEB',
            sub: `${profile.totalRatings || 0} ratings` },
          { icon: '💵', label: 'All-time Earnings', value: `₹${parseFloat(profile.totalEarnings || 0).toFixed(2)}`, color: '#0369A1',       bg: '#F0F9FF' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            {s.sub && <div className="stat-sub">{s.sub}</div>}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${tab === 'dashboard' ? 'active' : ''}`} onClick={() => setTab('dashboard')}>Dashboard</button>
        <button className={`tab ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>
          History {history.length > 0 && `(${history.length})`}
        </button>
      </div>

      {tab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {activeOrder ? (
            <ActiveDeliveryCard order={activeOrder} onPickedUp={handlePickedUp} onDelivered={handleDelivered} />
          ) : !profile.isAvailable ? (
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>😴</div>
              <h3>You're Offline</h3>
              <p style={{ color: 'var(--ink-50)', marginTop: '0.5rem' }}>Go online to start receiving delivery orders.</p>
              <button onClick={handleToggle} disabled={toggling} className="btn btn-primary" style={{ marginTop: '1.25rem' }}>Go Online</button>
            </div>
          ) : (
            <div className="card fade-up fade-up-2">
              <div className="section-header">
                <span className="section-title">Available Orders</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--ink-50)' }}>Updates every 15s</span>
              </div>
              {available.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">🔍</div>
                  <div className="empty-title">No orders available</div>
                  <div className="empty-desc">New orders will appear here automatically</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {available.map(order => <AvailableOrderCard key={order.id} order={order} onAccept={handleAccept} />)}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'history' && (
        <div className="card fade-up">
          <div className="section-title" style={{ marginBottom: '1.25rem' }}>Delivery History</div>
          {history.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📋</div>
              <div className="empty-title">No deliveries yet</div>
              <div className="empty-desc">Your completed deliveries will appear here</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {history.map(d => (
                <div key={d.id} className="ck-history-row">
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--ink)' }}>Order #{d.id}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--ink-50)' }}>
                      {d.customer?.name} · {d.deliveredAt
                        ? new Date(d.deliveredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : 'Delivered'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: 'var(--success)', fontSize: '1rem' }}>
                      +₹{parseFloat(d.earningAmount || (parseFloat(d.totalAmount || 0) * 0.10)).toFixed(2)}
                    </div>
                    <span className="badge badge-delivered" style={{ marginTop: '0.2rem' }}>Delivered</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        .ck-rider-hero {
          display: flex; align-items: center; justify-content: space-between;
          gap: 1.5rem; flex-wrap: wrap; padding: 1.75rem 2rem; border-radius: var(--r-xl);
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); margin-bottom: 2rem;
        }
        .ck-rider-hero-avatar { width: 52px; height: 52px; border-radius: var(--r-lg); background: rgba(255,255,255,0.12); display: flex; align-items: center; justify-content: center; font-size: 1.75rem; }
        .ck-toggle-btn { padding: 0.5rem 1.25rem; border-radius: var(--r-full); font-size: 0.875rem; font-weight: 700; cursor: pointer; border: none; font-family: var(--font-body); transition: all 0.15s ease; }
        .ck-toggle-btn.online  { background: #FEF2F2; color: #DC2626; }
        .ck-toggle-btn.offline { background: #DCFCE7; color: #16A34A; }
        .ck-toggle-btn:hover   { transform: scale(1.03); }
        .ck-toggle-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .ck-active-card { background: var(--white); border-radius: var(--r-xl); border: 2px solid var(--coral); box-shadow: 0 0 0 4px rgb(232 65 42 / 0.08); overflow: hidden; }
        .ck-active-card-header { display: flex; align-items: flex-start; justify-content: space-between; padding: 1.5rem 1.5rem 0; }
        .ck-active-badge { display: inline-flex; align-items: center; gap: 0.35rem; background: var(--coral-bg); color: var(--coral); font-size: 0.75rem; font-weight: 700; padding: 0.3rem 0.75rem; border-radius: var(--r-full); margin-bottom: 0.35rem; }
        .ck-earning-pill { background: var(--success-bg); color: var(--success); font-size: 1.1rem; font-weight: 700; padding: 0.4rem 0.875rem; border-radius: var(--r-full); }
        .ck-active-section { padding: 1rem 1.5rem; border-top: 1px solid var(--ink-05); }
        .ck-active-section-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-30); margin-bottom: 0.5rem; }
        .ck-customer-row { display: flex; align-items: center; gap: 0.75rem; }
        .ck-customer-avatar { width: 38px; height: 38px; border-radius: 50%; background: var(--ink-05); color: var(--ink-80); font-weight: 700; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; flex-shrink: 0; }
        .ck-address-box { display: flex; align-items: center; justify-content: space-between; gap: 1rem; background: var(--ink-05); padding: 0.75rem 1rem; border-radius: var(--r-md); font-size: 0.875rem; color: var(--ink-80); }
        .ck-avail-card { border: 1.5px solid var(--ink-10); border-radius: var(--r-lg); padding: 1rem 1.25rem; background: var(--white); transition: border-color 0.2s; }
        .ck-avail-card:hover { border-color: var(--coral); }
        .ck-avail-card-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 0.25rem; }
        .ck-history-row { display: flex; align-items: center; justify-content: space-between; padding: 0.875rem 0; border-bottom: 1px solid var(--ink-05); }
        .ck-history-row:last-child { border-bottom: none; }
      `}</style>
    </div>
  );
};

export default RiderDashboard;