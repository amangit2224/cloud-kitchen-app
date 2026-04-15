import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

const MAX_NOTIFICATIONS = 20;

const TYPE_CONFIG = {
  newOrder:          { icon: '🆕', color: '#16A34A', bg: '#F0FDF4', label: 'New Order'      },
  orderStatusUpdated:{ icon: '📦', color: '#0369A1', bg: '#F0F9FF', label: 'Status Update'  },
  orderCancelled:    { icon: '❌', color: '#DC2626', bg: '#FEF2F2', label: 'Cancelled'       },
};

const STATUS_LABELS = {
  pending:          'Order Placed',
  confirmed:        'Confirmed',
  preparing:        'Being Prepared',
  ready:            'Ready for Pickup',
  out_for_delivery: 'Out for Delivery',
  delivered:        'Delivered',
  cancelled:        'Cancelled',
};

const timeAgo = (ts) => {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60)   return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const NotificationBell = () => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [notifications, setNotifications] = useState([]);
  const [open, setOpen]                   = useState(false);
  const [unread, setUnread]               = useState(0);
  const panelRef = useRef(null);

  const addNotif = (type, data) => {
    const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.orderStatusUpdated;

    let message = '';
    if (type === 'newOrder') {
      message = `New order #${data.orderId} — ₹${parseFloat(data.totalAmount || 0).toFixed(0)}`;
    } else if (type === 'orderCancelled') {
      message = `Order #${data.orderId} was cancelled`;
    } else if (type === 'orderStatusUpdated') {
      const statusLabel = STATUS_LABELS[data.status] || data.status;
      message = `Order #${data.orderId} → ${statusLabel}`;
    }

    const notif = {
      id:        Date.now() + Math.random(),
      type,
      icon:      cfg.icon,
      color:     cfg.color,
      bg:        cfg.bg,
      label:     cfg.label,
      message,
      orderId:   data.orderId,
      timestamp: Date.now(),
      read:      false,
    };

    setNotifications(prev => [notif, ...prev].slice(0, MAX_NOTIFICATIONS));
    setUnread(prev => prev + 1);
  };

  // Subscribe to socket events
  useEffect(() => {
    if (!socket) return;

    const onNewOrder           = (d) => addNotif('newOrder', d);
    const onStatusUpdated      = (d) => addNotif('orderStatusUpdated', d);
    const onCancelled          = (d) => addNotif('orderCancelled', d);

    socket.on('newOrder',           onNewOrder);
    socket.on('orderStatusUpdated', onStatusUpdated);
    socket.on('orderCancelled',     onCancelled);

    return () => {
      socket.off('newOrder',           onNewOrder);
      socket.off('orderStatusUpdated', onStatusUpdated);
      socket.off('orderCancelled',     onCancelled);
    };
  }, [socket]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    setOpen(o => !o);
    if (!open) { setUnread(0); setNotifications(p => p.map(n => ({ ...n, read: true }))); }
  };

  const clearAll = () => { setNotifications([]); setUnread(0); };

  const linkFor = (n) => {
    if (!n.orderId) return null;
    return user?.role === 'admin' ? `/admin/orders` : `/orders/${n.orderId}`;
  };

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        type="button"
        onClick={handleOpen}
        style={{
          position: 'relative', width: 38, height: 38, borderRadius: 'var(--r-md)',
          background: 'transparent', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--ink-50)', transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--ink-05)'; e.currentTarget.style.color = 'var(--ink)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-50)'; }}
        aria-label="Notifications"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: 4, right: 4,
            minWidth: 16, height: 16, borderRadius: 'var(--r-full)',
            background: 'var(--coral)', color: 'white',
            fontSize: '0.6rem', fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 4px', lineHeight: 1,
            animation: unread > 0 ? 'bellPop 0.3s ease' : 'none',
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute', top: '110%', right: 0,
          width: 340, background: 'var(--white)',
          border: '1px solid var(--ink-10)', borderRadius: 'var(--r-xl)',
          boxShadow: 'var(--shadow-xl)', zIndex: 500,
          animation: 'dropIn 0.18s cubic-bezier(0.34,1.56,0.64,1)',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--ink-10)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ink)' }}>Notifications</span>
              {notifications.length > 0 && (
                <span style={{ background: 'var(--ink-05)', color: 'var(--ink-50)', fontSize: '0.68rem', fontWeight: 600, padding: '0.1rem 0.5rem', borderRadius: 'var(--r-full)' }}>
                  {notifications.length}
                </span>
              )}
            </div>
            {notifications.length > 0 && (
              <button onClick={clearAll} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--ink-50)', fontFamily: 'var(--font-body)' }}
                onMouseEnter={e => e.target.style.color = 'var(--coral)'}
                onMouseLeave={e => e.target.style.color = 'var(--ink-50)'}>
                Clear all
              </button>
            )}
          </div>

          {/* Notification list */}
          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '2.5rem 1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔔</div>
                <p style={{ color: 'var(--ink-50)', fontSize: '0.85rem' }}>No notifications yet</p>
                <p style={{ color: 'var(--ink-30)', fontSize: '0.78rem', marginTop: '0.25rem' }}>
                  {user?.role === 'admin' ? 'New orders and status changes will appear here' : 'Your order updates will appear here'}
                </p>
              </div>
            ) : (
              notifications.map(n => {
                const href = linkFor(n);
                const Inner = (
                  <div style={{
                    display: 'flex', gap: '0.75rem', padding: '0.75rem 1rem',
                    borderBottom: '1px solid var(--ink-05)',
                    background: n.read ? 'transparent' : 'rgba(232,65,42,0.03)',
                    transition: 'background 0.15s',
                    cursor: href ? 'pointer' : 'default',
                    textDecoration: 'none',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--ink-05)'}
                    onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(232,65,42,0.03)'}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 'var(--r-md)',
                      background: n.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.1rem', flexShrink: 0,
                    }}>
                      {n.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: n.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{n.label}</span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--ink-30)' }}>{timeAgo(n.timestamp)}</span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--ink-80)', margin: 0, lineHeight: 1.4 }}>{n.message}</p>
                    </div>
                    {!n.read && (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--coral)', flexShrink: 0, marginTop: 4 }} />
                    )}
                  </div>
                );

                return href ? (
                  <Link key={n.id} to={href} onClick={() => setOpen(false)} style={{ display: 'block', textDecoration: 'none' }}>
                    {Inner}
                  </Link>
                ) : (
                  <div key={n.id}>{Inner}</div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{ padding: '0.6rem 1rem', borderTop: '1px solid var(--ink-10)', textAlign: 'center' }}>
              {user?.role === 'admin' ? (
                <Link to="/admin/orders" onClick={() => setOpen(false)}
                  style={{ fontSize: '0.78rem', color: 'var(--coral)', fontWeight: 600, textDecoration: 'none' }}>
                  View All Orders →
                </Link>
              ) : (
                <Link to="/orders" onClick={() => setOpen(false)}
                  style={{ fontSize: '0.78rem', color: 'var(--coral)', fontWeight: 600, textDecoration: 'none' }}>
                  View All Orders →
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes bellPop { 0%{transform:scale(0.5)} 70%{transform:scale(1.2)} 100%{transform:scale(1)} }
        @keyframes dropIn  { from{opacity:0;transform:translateY(-8px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
      `}</style>
    </div>
  );
};

export default NotificationBell;