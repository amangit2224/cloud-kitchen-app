import React, { useState, useEffect, useRef } from 'react';
import { getDashboardStats, getRevenueByDay, getTopSellingItems, getOrdersByStatus } from '../../services/analyticsService';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

/* ─── tiny hook: destroys old chart before creating new ── */
const useChart = (canvasRef, buildFn, deps) => {
  const chartRef = useRef(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) { chartRef.current.destroy(); }
    chartRef.current = buildFn(canvasRef.current.getContext('2d'));
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, deps); // eslint-disable-line
};

const CORAL       = '#E8412A';
const CORAL_LIGHT = 'rgba(232,65,42,0.15)';
const INK         = '#1C1917';

const AdminAnalytics = () => {
  const [stats,    setStats]    = useState(null);
  const [revenue,  setRevenue]  = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [byStatus, setByStatus] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [range,    setRange]    = useState(7); // days

  const revenueRef = useRef(null);
  const statusRef  = useRef(null);
  const itemsRef   = useRef(null);

  const fetchAll = async () => {
    try {
      const [s, r, t, b] = await Promise.all([
        getDashboardStats().catch(() => null),
        getRevenueByDay().catch(() => ({ data: { revenueByDay: [] } })),
        getTopSellingItems(5).catch(() => ({ data: { topItems: [] } })),
        getOrdersByStatus().catch(() => ({ data: { ordersByStatus: [] } })),
      ]);
      setStats(s?.data || null);
      setRevenue(r?.data?.revenueByDay || []);
      setTopItems(t?.data?.topItems || []);
      setByStatus(b?.data?.ordersByStatus || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  /* Revenue line chart */
  useChart(revenueRef, (ctx) => {
    if (!revenue.length) return null;
    const labels = revenue.map(d => {
      const dt = new Date(d.date);
      return dt.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    });
    return new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Revenue (₹)',
            data: revenue.map(d => parseFloat(d.revenue || 0)),
            borderColor: CORAL, backgroundColor: CORAL_LIGHT,
            fill: true, tension: 0.4, pointBackgroundColor: CORAL, pointRadius: 5,
          },
          {
            label: 'Orders',
            data: revenue.map(d => parseInt(d.orders || 0)),
            borderColor: '#0369A1', backgroundColor: 'rgba(3,105,161,0.1)',
            fill: true, tension: 0.4, pointBackgroundColor: '#0369A1', pointRadius: 5,
            yAxisID: 'orders',
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'top' } },
        scales: {
          y:      { type: 'linear', position: 'left',  title: { display: true, text: 'Revenue (₹)' } },
          orders: { type: 'linear', position: 'right', title: { display: true, text: 'Orders' }, grid: { drawOnChartArea: false } },
        }
      }
    });
  }, [revenue]);

  /* Status doughnut chart */
  useChart(statusRef, (ctx) => {
    if (!byStatus.length) return null;
    const STATUS_COLORS = {
      pending: '#D97706', confirmed: '#1D4ED8', preparing: '#7C3AED',
      ready: '#C2410C', out_for_delivery: '#0891B2', delivered: '#16A34A', cancelled: '#DC2626',
    };
    return new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: byStatus.map(s => s.status.replace(/_/g, ' ')),
        datasets: [{
          data: byStatus.map(s => parseInt(s.count)),
          backgroundColor: byStatus.map(s => STATUS_COLORS[s.status] || '#94A3B8'),
          borderWidth: 2, borderColor: '#fff',
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'right' } },
        cutout: '65%',
      }
    });
  }, [byStatus]);

  /* Top items horizontal bar */
  useChart(itemsRef, (ctx) => {
    if (!topItems.length) return null;
    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: topItems.map(i => i.menuItem?.name || `Item ${i.menuItemId}`),
        datasets: [{
          label: 'Units Sold',
          data: topItems.map(i => parseInt(i.totalQuantity)),
          backgroundColor: [CORAL, '#E8412A99', '#E8412A66', '#E8412A44', '#E8412A22'],
          borderRadius: 6,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { title: { display: true, text: 'Units Sold' } } }
      }
    });
  }, [topItems]);

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="spinner" style={{ width: 36, height: 36 }} />
    </div>
  );

  const sd = stats?.data || stats || {};

  return (
    <div className="page page-wide fade-up">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Analytics</h1>
          <p style={{ color: 'var(--ink-50)', fontSize: '0.875rem', marginTop: '0.2rem' }}>Business performance overview</p>
        </div>
        <button onClick={fetchAll} className="btn btn-primary btn-sm">↻ Refresh</button>
      </div>

      {/* KPI Cards */}
      <div className="grid-4 fade-up fade-up-1" style={{ marginBottom: '2rem' }}>
        {[
          { icon: '💰', label: 'Total Revenue',    value: `₹${parseFloat(sd.totalRevenue   || 0).toLocaleString('en-IN')}`, sub: `₹${parseFloat(sd.revenueLastWeek || 0).toFixed(0)} last 7 days`, color: '#16A34A', bg: '#F0FDF4' },
          { icon: '📦', label: 'Total Orders',     value: sd.totalOrders    || 0,  sub: `${sd.ordersLastWeek || 0} last 7 days`,    color: CORAL,     bg: 'var(--coral-bg)' },
          { icon: '👥', label: 'Total Customers',  value: sd.totalCustomers || 0,  sub: `${sd.newCustomersLastWeek || 0} new this week`, color: '#0369A1', bg: '#F0F9FF' },
          { icon: '⭐', label: 'Avg Rating',       value: sd.avgRating      || '—',sub: 'from customer reviews',              color: '#D97706', bg: '#FFFBEB' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="card fade-up fade-up-2" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <span className="section-title">Revenue & Orders — Last 7 Days</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--ink-50)' }}>Updates daily</span>
        </div>
        {revenue.length === 0 ? (
          <div className="empty"><div className="empty-icon">📈</div><div className="empty-desc">No revenue data yet</div></div>
        ) : (
          <div style={{ height: 280 }}><canvas ref={revenueRef} /></div>
        )}
      </div>

      {/* Bottom row: doughnut + bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="fade-up fade-up-3">

        {/* Orders by status */}
        <div className="card">
          <div className="section-title" style={{ marginBottom: '1.25rem' }}>Orders by Status</div>
          {byStatus.length === 0 ? (
            <div className="empty"><div className="empty-icon">📊</div><div className="empty-desc">No order data yet</div></div>
          ) : (
            <div style={{ height: 260 }}><canvas ref={statusRef} /></div>
          )}
        </div>

        {/* Top selling items */}
        <div className="card">
          <div className="section-title" style={{ marginBottom: '1.25rem' }}>Top 5 Selling Items</div>
          {topItems.length === 0 ? (
            <div className="empty"><div className="empty-icon">🍽️</div><div className="empty-desc">No sales data yet</div></div>
          ) : (
            <div style={{ height: 260 }}><canvas ref={itemsRef} /></div>
          )}
        </div>
      </div>

      {/* Extra stats */}
      <div className="grid-4 fade-up fade-up-4" style={{ marginTop: '1.5rem' }}>
        {[
          { icon: '🍽️', label: 'Menu Items',      value: sd.totalMenuItems    || 0, sub: `${sd.availableMenuItems || 0} available` },
          { icon: '⏳', label: 'Pending Orders',  value: sd.pendingOrders     || 0, sub: 'awaiting confirmation' },
          { icon: '📊', label: 'Avg Order Value', value: `₹${parseFloat(sd.avgOrderValue || 0).toFixed(0)}`, sub: 'per order' },
          { icon: '📅', label: 'Orders (7d)',     value: sd.ordersLastWeek     || 0, sub: 'last 7 days' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--ink-05)' }}>{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          [style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default AdminAnalytics;