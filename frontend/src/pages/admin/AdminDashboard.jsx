import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getDashboardStats } from '../../services/analyticsService';
import { getAllOrders, updateOrderStatus } from '../../services/orderService';
import { getAllRiders } from '../../services/riderService';

const PIPELINE = [
  { status: 'pending',   label: 'Pending',   color: '#D97706', bg: '#FFFBEB', next: 'confirmed' },
  { status: 'confirmed', label: 'Confirmed', color: '#1D4ED8', bg: '#EFF6FF', next: 'preparing' },
  { status: 'preparing', label: 'Preparing', color: '#7C3AED', bg: '#F5F3FF', next: 'ready'     },
  { status: 'ready',     label: 'Ready',     color: '#C2410C', bg: '#FFF7ED', next: null         },
];

const MiniOrderCard = ({ order, onUpdate }) => {
  const [updating, setUpdating] = useState(false);
  const pipeline = PIPELINE.find(p => p.status === order.status);
  if (!pipeline) return null;

  const handleAdvance = async (e) => {
    e.preventDefault();
    if (!pipeline.next) return;
    setUpdating(true);
    try {
      await updateOrderStatus(order.id, pipeline.next);
      toast.success(`Order #${order.id} → ${pipeline.next}`);
      onUpdate();
    } catch { toast.error('Update failed'); }
    finally { setUpdating(false); }
  };

  return (
    <div className="ck-mini-order" style={{ borderLeftColor: pipeline.color, background: pipeline.bg }}>
      <div className="ck-mini-order-top">
        <span className="ck-mini-order-id">#{order.id}</span>
        <span className="ck-mini-order-amount">₹{parseFloat(order.totalAmount || 0).toFixed(2)}</span>
      </div>
      <div className="ck-mini-order-customer">{order.user?.name || 'Customer'}</div>
      <div className="ck-mini-order-items">{order.orderItems?.length || 0} item(s)</div>
      {pipeline.next && (
        <button onClick={handleAdvance} disabled={updating} className="ck-mini-order-btn">
          {updating ? '...' : `Mark ${pipeline.next.charAt(0).toUpperCase() + pipeline.next.slice(1)}`}
        </button>
      )}
      {order.status === 'ready' && !order.riderId && (
        <Link to="/admin/orders" className="ck-mini-order-btn" style={{ background: 'var(--coral)', color: 'white' }}>
          Assign Rider →
        </Link>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats]   = useState(null);
  const [orders, setOrders] = useState([]);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      // Fetch all data with error handling for each
      const statsPromise = getDashboardStats().catch(err => {
        console.error('Stats error:', err);
        return { data: null };
      });
      
      const ordersPromise = getAllOrders().catch(err => {
        console.error('Orders error:', err);
        return { data: { orders: [] } };
      });
      
      const ridersPromise = getAllRiders().catch(err => {
        console.error('Riders error:', err);
        return { data: { riders: [] } };
      });

      const [statsRes, ordersRes, ridersRes] = await Promise.all([
        statsPromise,
        ordersPromise,
        ridersPromise
      ]);
      
      // Safely extract data
      setStats(statsRes?.data || null);
      
      // Handle orders response - could be array or object with orders property
      let ordersData = ordersRes?.data?.orders || ordersRes?.data || [];
      if (!Array.isArray(ordersData)) {
        ordersData = [];
      }
      setOrders(ordersData);
      
      // Handle riders response
      let ridersData = ridersRes?.data?.riders || ridersRes?.data || [];
      if (!Array.isArray(ridersData)) {
        ridersData = [];
      }
      setRiders(ridersData);
      
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error('Failed to load dashboard data');
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchAll();
    const t = setInterval(fetchAll, 15000);
    return () => clearInterval(t);
  }, []);

  // Safely calculate values
  const activeOrders = orders.filter(o => o && ['pending','confirmed','preparing','ready','out_for_delivery'].includes(o.status));
  const todayOrders = orders.filter(o => {
    if (!o || !o.createdAt) return false;
    const d = new Date(o.createdAt); 
    const now = new Date();
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const todayRevenue = todayOrders.filter(o => o && o.status === 'delivered').reduce((s, o) => s + parseFloat(o.totalAmount || 0), 0);
  const onlineRiders = riders.filter(r => r && r.isAvailable && r.approvalStatus === 'approved');
  const pendingRiders = riders.filter(r => r && r.approvalStatus === 'pending');
  const pipelineData = PIPELINE.map(p => ({ 
    ...p, 
    orders: orders.filter(o => o && o.status === p.status) 
  }));

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
        <p style={{ marginTop: '1rem', color: 'var(--ink-50)' }}>Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="page page-wide fade-up">

      {/* Header */}
      <div className="ck-admin-header fade-up">
        <div>
          <h1>Dashboard</h1>
          <p style={{ color: 'var(--ink-50)', marginTop: '0.25rem', fontSize: '0.875rem' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            <span style={{ marginLeft: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', display: 'inline-block', animation: 'pulse-bar 2s infinite' }} />
              Live
            </span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/admin/orders" className="btn btn-outline btn-sm">View All Orders</Link>
          <button onClick={fetchAll} className="btn btn-primary btn-sm">↻ Refresh</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-4 fade-up fade-up-1" style={{ marginBottom: '2rem' }}>
        {[
          { icon: '💰', label: "Today's Revenue", color: '#16A34A', bg: '#F0FDF4',
            value: `₹${todayRevenue.toFixed(2)}`,
            sub: `${todayOrders.filter(o => o.status === 'delivered').length} orders delivered today` },
          { icon: '📋', label: 'Active Orders', color: '#D97706', bg: '#FFFBEB',
            value: activeOrders.length,
            sub: `${orders.filter(o => o.status === 'ready').length} ready for pickup` },
          { icon: '🛵', label: 'Online Riders', color: '#0369A1', bg: '#F0F9FF',
            value: onlineRiders.length,
            sub: pendingRiders.length > 0 ? `${pendingRiders.length} pending approval` : 'No pending approvals' },
          { icon: '📦', label: 'Total Orders', color: 'var(--coral)', bg: 'var(--coral-bg)',
            value: orders.length,
            sub: stats?.data?.totalRevenue ? `₹${parseFloat(stats.data.totalRevenue).toFixed(0)} all-time` : 'All time' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Additional Stats Row */}
      {stats?.data && (
        <div className="grid-4 fade-up fade-up-1" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#FEF3C7' }}>⭐</div>
            <div className="stat-label">Avg Rating</div>
            <div className="stat-value" style={{ color: '#F59E0B' }}>{stats.data.avgRating || '0.0'}</div>
            <div className="stat-sub">from customer reviews</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#F5F3FF' }}>🍽️</div>
            <div className="stat-label">Menu Items</div>
            <div className="stat-value" style={{ color: '#8B5CF6' }}>{stats.data.totalMenuItems || 0}</div>
            <div className="stat-sub">{stats.data.availableMenuItems || 0} available</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#EFF6FF' }}>📈</div>
            <div className="stat-label">Revenue (7d)</div>
            <div className="stat-value" style={{ color: '#1D4ED8' }}>₹{parseFloat(stats.data.revenueLastWeek || 0).toFixed(0)}</div>
            <div className="stat-sub">last 7 days</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#F0FDF4' }}>👥</div>
            <div className="stat-label">New Customers</div>
            <div className="stat-value" style={{ color: '#16A34A' }}>{stats.data.newCustomersLastWeek || 0}</div>
            <div className="stat-sub">last 7 days</div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>

        {/* Live Pipeline */}
        <div className="card fade-up fade-up-2">
          <div className="section-header">
            <span className="section-title">Live Order Pipeline</span>
            <Link to="/admin/orders" className="btn btn-ghost btn-sm">See all →</Link>
          </div>
          <div className="ck-pipeline">
            {pipelineData.map(col => (
              <div key={col.status} className="ck-pipeline-col">
                <div className="ck-pipeline-header" style={{ color: col.color }}>
                  <span className="ck-pipeline-label">{col.label}</span>
                  <span className="ck-pipeline-count" style={{ background: col.bg, color: col.color }}>{col.orders.length}</span>
                </div>
                <div className="ck-pipeline-orders">
                  {col.orders.length === 0 ? (
                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--ink-30)', fontSize: '0.8rem' }}>Empty</div>
                  ) : col.orders.slice(0, 4).map(order => (
                    <MiniOrderCard key={order.id} order={order} onUpdate={fetchAll} />
                  ))}
                  {col.orders.length > 4 && (
                    <Link to="/admin/orders" style={{ display: 'block', textAlign: 'center', fontSize: '0.78rem', color: 'var(--coral)', padding: '0.5rem' }}>
                      +{col.orders.length - 4} more
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Riders Panel */}
          <div className="card fade-up fade-up-3">
            <div className="section-header">
              <span className="section-title">Riders</span>
              <Link to="/admin/riders" className="btn btn-ghost btn-sm">Manage →</Link>
            </div>
            {riders.length === 0 ? (
              <div className="empty" style={{ padding: '1.5rem' }}>
                <div className="empty-icon">🛵</div>
                <div className="empty-desc">No riders yet</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {riders.slice(0, 6).map(rider => (
                  <div key={rider.id} className="ck-rider-row">
                    <div className="ck-rider-avatar">{rider.user?.name?.charAt(0) || '?'}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="ck-rider-name">{rider.user?.name || 'Unknown'}</div>
                      <div className="ck-rider-meta">{rider.vehicleType || 'N/A'} · ⭐ {parseFloat(rider.rating || 5).toFixed(1)}</div>
                    </div>
                    <span className={`badge badge-dot badge-${rider.approvalStatus === 'approved' && rider.isAvailable ? 'online' : rider.approvalStatus === 'pending' ? 'pending' : 'offline'}`}>
                      {rider.approvalStatus === 'approved' ? (rider.isAvailable ? 'Online' : 'Offline') : rider.approvalStatus}
                    </span>
                  </div>
                ))}
                {riders.length > 6 && (
                  <Link to="/admin/riders" style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--coral)', padding: '0.5rem' }}>
                    View all {riders.length} riders
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="card fade-up fade-up-4">
            <div className="section-title" style={{ marginBottom: '1rem' }}>Order Summary</div>
            {[
              { label: 'Out for Delivery', value: orders.filter(o => o.status === 'out_for_delivery').length, color: '#155E75' },
              { label: 'Delivered Today',  value: todayOrders.filter(o => o.status === 'delivered').length,   color: 'var(--success)' },
              { label: 'Cancelled Today',  value: todayOrders.filter(o => o.status === 'cancelled').length,   color: 'var(--danger)' },
              { label: 'Total Delivered',  value: orders.filter(o => o.status === 'delivered').length,         color: 'var(--ink)' },
            ].map(s => (
              <div key={s.label} className="ck-summary-row">
                <span className="ck-summary-label">{s.label}</span>
                <span className="ck-summary-value" style={{ color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .ck-admin-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
        .ck-pipeline { display: grid; grid-template-columns: repeat(4,1fr); gap: 1rem; }
        .ck-pipeline-col { display: flex; flex-direction: column; gap: 0.75rem; }
        .ck-pipeline-header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 0.5rem; border-bottom: 2px solid currentColor; }
        .ck-pipeline-label { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
        .ck-pipeline-count { min-width: 22px; height: 22px; border-radius: var(--r-full); font-size: 0.72rem; font-weight: 700; display: flex; align-items: center; justify-content: center; padding: 0 6px; }
        .ck-pipeline-orders { display: flex; flex-direction: column; gap: 0.5rem; min-height: 60px; }
        .ck-mini-order { border-left: 3px solid; border-radius: var(--r-md); padding: 0.65rem 0.75rem; display: flex; flex-direction: column; gap: 0.25rem; }
        .ck-mini-order-top { display: flex; justify-content: space-between; }
        .ck-mini-order-id { font-size: 0.78rem; font-weight: 700; color: var(--ink); }
        .ck-mini-order-amount { font-size: 0.78rem; font-weight: 700; color: var(--ink); }
        .ck-mini-order-customer { font-size: 0.75rem; color: var(--ink-80); }
        .ck-mini-order-items { font-size: 0.72rem; color: var(--ink-50); }
        .ck-mini-order-btn { display: block; text-align: center; padding: 0.3rem 0.5rem; background: var(--ink); color: white; border: none; cursor: pointer; border-radius: var(--r-sm); font-size: 0.72rem; font-weight: 600; font-family: var(--font-body); text-decoration: none; margin-top: 0.35rem; transition: opacity 0.15s; }
        .ck-mini-order-btn:hover { opacity: 0.85; }
        .ck-rider-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0; border-bottom: 1px solid var(--ink-05); }
        .ck-rider-row:last-child { border-bottom: none; }
        .ck-rider-avatar { width: 34px; height: 34px; border-radius: 50%; background: var(--coral-bg); color: var(--coral); font-weight: 700; font-size: 0.875rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .ck-rider-name { font-size: 0.85rem; font-weight: 600; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ck-rider-meta { font-size: 0.75rem; color: var(--ink-50); }
        .ck-summary-row { display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--ink-05); }
        .ck-summary-row:last-child { border-bottom: none; }
        .ck-summary-label { font-size: 0.85rem; color: var(--ink-80); }
        .ck-summary-value { font-size: 1rem; font-weight: 700; }
        @keyframes pulse-bar { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        @media (max-width: 1024px) { .ck-pipeline { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 768px) {
          .ck-pipeline { grid-template-columns: 1fr; }
          .ck-admin-header > div:last-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;