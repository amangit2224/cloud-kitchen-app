import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllOrders } from '../services/orderService';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending:          { label: 'Pending',      icon: '🕐', step: 0 },
  confirmed:        { label: 'Confirmed',    icon: '✅', step: 1 },
  preparing:        { label: 'Preparing',    icon: '👨‍🍳', step: 2 },
  ready:            { label: 'Ready',        icon: '📦', step: 3 },
  out_for_delivery: { label: 'On the way',   icon: '🛵', step: 4 },
  delivered:        { label: 'Delivered',    icon: '🎉', step: 5 },
  cancelled:        { label: 'Cancelled',    icon: '❌', step: -1 },
};

const OrderCard = ({ order }) => {
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const isActive = !['delivered', 'cancelled'].includes(order.status);
  const totalItems = order.orderItems?.reduce((s, i) => s + i.quantity, 0) || order.items?.length || 0;

  return (
    <Link to={`/orders/${order.id}`} className="ck-order-card" data-active={isActive}>
      <div className="ck-order-card-top">
        <div>
          <div className="ck-order-card-id">Order #{order.id}</div>
          <div className="ck-order-card-date">
            {new Date(order.createdAt).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </div>
        </div>
        <span className={`badge badge-${order.status}`}>{cfg.icon} {cfg.label}</span>
      </div>

      {isActive && order.status !== 'cancelled' && (
        <div className="ck-order-progress">
          {[0,1,2,3,4,5].map(step => (
            <div key={step} className={`ck-progress-step ${cfg.step >= step ? 'done' : ''} ${cfg.step === step ? 'current' : ''}`} />
          ))}
        </div>
      )}

      <div className="ck-order-card-bottom">
        <span className="ck-order-items">{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
        <span className="ck-order-total">₹{parseFloat(order.totalAmount || 0).toFixed(2)}</span>
      </div>

      {order.riderId && order.status === 'out_for_delivery' && (
        <div className="ck-rider-chip">🛵 Rider is on the way!</div>
      )}
    </Link>
  );
};

// Admin Stats Component
const AdminStats = ({ orders }) => {
  const totalOrders = orders.length;
  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const completedOrders = orders.filter(o => o.status === 'delivered');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending');

  return (
    <>
      <div className="grid-4 fade-up fade-up-1" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--coral-bg)' }}>📊</div>
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{totalOrders}</div>
          <div className="stat-sub">all time</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--info-bg)' }}>🛵</div>
          <div className="stat-label">Active Orders</div>
          <div className="stat-value" style={{ color: activeOrders.length > 0 ? 'var(--coral)' : 'var(--ink)' }}>
            {activeOrders.length}
          </div>
          <div className="stat-sub">{activeOrders.length > 0 ? 'in progress' : 'all clear'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-bg)' }}>💰</div>
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">₹{totalRevenue.toFixed(2)}</div>
          <div className="stat-sub">from completed orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--warning-bg)' }}>⏳</div>
          <div className="stat-label">Pending</div>
          <div className="stat-value">{pendingOrders.length}</div>
          <div className="stat-sub">need confirmation</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="section-header" style={{ marginBottom: '1rem' }}>
          <h3 className="section-title">Quick Actions</h3>
        </div>
        <div className="grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <Link to="/admin/menu" className="btn btn-primary" style={{ justifyContent: 'center' }}>
            🍽️ Manage Menu
          </Link>
          <Link to="/admin/orders" className="btn btn-outline" style={{ justifyContent: 'center' }}>
            📋 View All Orders
          </Link>
          <Link to="/admin/riders" className="btn btn-outline" style={{ justifyContent: 'center' }}>
            🛵 Manage Riders
          </Link>
        </div>
      </div>
    </>
  );
};

// Customer Orders Component
const CustomerOrders = ({ orders, loading, tab, setTab, activeOrders, pastOrders }) => {
  const displayOrders = tab === 'active' ? activeOrders : pastOrders;
  const totalSpent = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <>
      {/* Hero Section - Only for customers */}
      <div className="ck-dash-hero">
        <div>
          <p className="ck-dash-greeting">{greeting} 👋</p>
          <h1 className="ck-dash-name">What are you craving today?</h1>
          <p className="ck-dash-sub">Fresh ingredients, made to order, delivered fast</p>
        </div>
        <Link to="/menu" className="btn btn-primary btn-lg">Order Now →</Link>
      </div>

      {/* Stats - Customer View */}
      <div className="grid-4 fade-up fade-up-1" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--ink-05)' }}>📦</div>
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{orders.length}</div>
          <div className="stat-sub">all time</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: activeOrders.length > 0 ? 'var(--coral-bg)' : 'var(--ink-05)' }}>
            🛵
          </div>
          <div className="stat-label">Active Orders</div>
          <div className="stat-value" style={{ color: activeOrders.length > 0 ? 'var(--coral)' : 'var(--ink)' }}>
            {activeOrders.length}
          </div>
          <div className="stat-sub">{activeOrders.length ? 'in progress' : 'all clear'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--ink-05)' }}>💰</div>
          <div className="stat-label">Total Spent</div>
          <div className="stat-value">₹{totalSpent.toFixed(2)}</div>
          <div className="stat-sub">delivered orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--ink-05)' }}>✅</div>
          <div className="stat-label">Delivered</div>
          <div className="stat-value">{orders.filter(o => o.status === 'delivered').length}</div>
          <div className="stat-sub">completed</div>
        </div>
      </div>

      {/* Orders Section */}
      <div className="card fade-up fade-up-2">
        <div className="tabs">
          <button className={`tab ${tab === 'active' ? 'active' : ''}`} onClick={() => setTab('active')}>
            Active Orders {activeOrders.length > 0 && <span className="ck-tab-count">{activeOrders.length}</span>}
          </button>
          <button className={`tab ${tab === 'past' ? 'active' : ''}`} onClick={() => setTab('past')}>
            Order History
          </button>
        </div>

        {loading ? (
          <div className="empty">
            <div className="spinner" />
            <p style={{ marginTop: '1rem', color: 'var(--ink-50)' }}>Loading orders...</p>
          </div>
        ) : displayOrders.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">{tab === 'active' ? '✅' : '📦'}</div>
            <div className="empty-title">{tab === 'active' ? 'No active orders' : 'No past orders yet'}</div>
            <div className="empty-desc">{tab === 'active' ? 'All clear!' : 'Your order history will appear here'}</div>
            {tab === 'active' && (
              <Link to="/menu" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Menu</Link>
            )}
          </div>
        ) : (
          <div className="ck-orders-grid">
            {displayOrders.map(order => <OrderCard key={order.id} order={order} />)}
          </div>
        )}
      </div>
    </>
  );
};

// Admin Orders Component
const AdminOrdersList = ({ orders, loading }) => {
  const [adminTab, setAdminTab] = useState('active');
  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const completedOrders = orders.filter(o => ['delivered', 'cancelled'].includes(o.status));
  const displayOrders = adminTab === 'active' ? activeOrders : completedOrders;

  return (
    <div className="card fade-up fade-up-2">
      <div className="tabs">
        <button className={`tab ${adminTab === 'active' ? 'active' : ''}`} onClick={() => setAdminTab('active')}>
          Active Orders {activeOrders.length > 0 && <span className="ck-tab-count">{activeOrders.length}</span>}
        </button>
        <button className={`tab ${adminTab === 'completed' ? 'active' : ''}`} onClick={() => setAdminTab('completed')}>
          Completed / Cancelled
        </button>
      </div>

      {loading ? (
        <div className="empty">
          <div className="spinner" />
          <p style={{ marginTop: '1rem', color: 'var(--ink-50)' }}>Loading orders...</p>
        </div>
      ) : displayOrders.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📋</div>
          <div className="empty-title">{adminTab === 'active' ? 'No active orders' : 'No completed orders'}</div>
          <div className="empty-desc">Orders will appear here when customers place them</div>
        </div>
      ) : (
        <div className="ck-orders-grid">
          {displayOrders.map(order => <OrderCard key={order.id} order={order} />)}
        </div>
      )}
    </div>
  );
};

const Home = () => {
  const { user, isAdmin, isCustomer, isRider } = useAuth();
  
  // Redirect riders to their dashboard
  if (isRider) {
    return <Navigate to="/rider/dashboard" replace />;
  }
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('active');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await getAllOrders();
        setOrders(res.data.orders || res.data || []);
      } catch {
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const pastOrders = orders.filter(o => ['delivered', 'cancelled'].includes(o.status));

  // Show appropriate content based on user role
  const renderContent = () => {
    // Admin view
    if (isAdmin) {
      return (
        <>
          {/* Admin Dashboard Header */}
          <div className="ck-admin-header fade-up">
            <div>
              <h1>Admin Dashboard</h1>
              <p style={{ color: 'var(--ink-50)', marginTop: '0.25rem' }}>
                Welcome back, {user?.name?.split(' ')[0] || 'Admin'} 👋
              </p>
            </div>
          </div>
          
          {/* Admin Stats */}
          <AdminStats orders={orders} />
          
          {/* Admin Orders List */}
          <AdminOrdersList orders={orders} loading={loading} />
        </>
      );
    }

    // Customer view (default)
    return (
      <CustomerOrders
        orders={orders}
        loading={loading}
        tab={tab}
        setTab={setTab}
        activeOrders={activeOrders}
        pastOrders={pastOrders}
      />
    );
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page page-wide fade-up">
      {renderContent()}

      <style>{`
        .ck-admin-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.75rem;
          flex-wrap: wrap;
        }
        .ck-dash-hero {
          display: flex; align-items: flex-end; justify-content: space-between;
          gap: 1.5rem; margin-bottom: 2rem;
          padding: 2rem 2.5rem; border-radius: var(--r-xl);
          background: linear-gradient(135deg, #1C1917 0%, #3D2B1F 100%);
          position: relative; overflow: hidden; flex-wrap: wrap;
        }
        .ck-dash-hero::before {
          content: '🍽️'; position: absolute; right: -1rem; top: -1rem;
          font-size: 8rem; opacity: 0.07; transform: rotate(-15deg); pointer-events: none;
        }
        .ck-dash-greeting { font-size: 0.85rem; color: rgba(255,255,255,0.55); font-weight: 500; margin-bottom: 0.25rem; }
        .ck-dash-name     { font-family: var(--font-display); font-size: 2rem; color: white; line-height: 1.1; }
        .ck-dash-sub      { font-size: 0.9rem; color: rgba(255,255,255,0.5); margin-top: 0.35rem; }
        .ck-tab-count {
          display: inline-flex; align-items: center; justify-content: center;
          min-width: 18px; height: 18px; padding: 0 5px;
          background: var(--coral); color: white;
          font-size: 0.68rem; font-weight: 700; border-radius: var(--r-full); margin-left: 0.35rem;
        }
        .ck-orders-grid { display: flex; flex-direction: column; gap: 0.75rem; }
        .ck-order-card {
          display: block; text-decoration: none;
          border: 1.5px solid var(--ink-10); border-radius: var(--r-lg);
          padding: 1rem 1.25rem; transition: all 0.2s ease; background: var(--white);
        }
        .ck-order-card:hover { border-color: var(--coral); box-shadow: 0 0 0 3px rgb(232 65 42 / 0.08); transform: translateX(3px); }
        .ck-order-card[data-active="true"] { border-color: var(--coral); background: var(--coral-bg); }
        .ck-order-card-top    { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 0.75rem; }
        .ck-order-card-id     { font-weight: 700; color: var(--ink); font-size: 0.95rem; }
        .ck-order-card-date   { font-size: 0.78rem; color: var(--ink-50); margin-top: 0.15rem; }
        .ck-order-progress    { display: flex; gap: 4px; margin-bottom: 0.75rem; }
        .ck-progress-step     { flex: 1; height: 4px; border-radius: 2px; background: var(--ink-10); transition: background 0.3s ease; }
        .ck-progress-step.done    { background: var(--coral); }
        .ck-progress-step.current { background: var(--coral); animation: pulse-bar 1.5s infinite; }
        @keyframes pulse-bar { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        .ck-order-card-bottom { display: flex; justify-content: space-between; align-items: center; }
        .ck-order-items { font-size: 0.82rem; color: var(--ink-50); }
        .ck-order-total { font-weight: 700; color: var(--ink); font-size: 0.95rem; }
        .ck-rider-chip {
          margin-top: 0.6rem; padding: 0.4rem 0.75rem;
          background: #CFFAFE; color: #155E75;
          border-radius: var(--r-full); font-size: 0.78rem; font-weight: 600; display: inline-block;
        }
        .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
        @media (max-width: 768px) {
          .grid-2 { grid-template-columns: 1fr; }
          .ck-dash-hero { padding: 1.5rem; text-align: center; justify-content: center; }
        }
      `}</style>
    </div>
  );
};

export default Home;