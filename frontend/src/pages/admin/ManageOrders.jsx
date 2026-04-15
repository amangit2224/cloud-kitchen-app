import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { getAvailableRiders, assignRider } from '../../services/riderService';
import { getAllOrders, updateOrderStatus } from '../../services/orderService';

const STATUS_CONFIG = {
  pending:          { color: 'bg-yellow-100 text-yellow-800',  label: 'Pending',          badge: '#FEF9C3', text: '#854D0E' },
  confirmed:        { color: 'bg-blue-100 text-blue-800',      label: 'Confirmed',        badge: '#DBEAFE', text: '#1E40AF' },
  preparing:        { color: 'bg-purple-100 text-purple-800',  label: 'Preparing',        badge: '#EDE9FE', text: '#5B21B6' },
  ready:            { color: 'bg-orange-100 text-orange-800',  label: 'Ready',            badge: '#FFEDD5', text: '#9A3412' },
  out_for_delivery: { color: 'bg-cyan-100 text-cyan-800',      label: 'Out for Delivery', badge: '#CFFAFE', text: '#155E75' },
  delivered:        { color: 'bg-green-100 text-green-800',    label: 'Delivered',        badge: '#DCFCE7', text: '#15803D' },
  cancelled:        { color: 'bg-red-100 text-red-800',        label: 'Cancelled',        badge: '#FEE2E2', text: '#B91C1C' },
};

const NEXT_STATUS = { pending: 'confirmed', confirmed: 'preparing', preparing: 'ready' };
const VEHICLE_ICON = { bicycle: '🚲', motorcycle: '🛵', car: '🚗' };

// ── Assign Rider Modal ───────────────────────────────────────────────────────
const AssignRiderModal = ({ order, onClose, onAssigned }) => {
  const [riders, setRiders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selected, setSelected]   = useState(null);

  useEffect(() => {
    getAvailableRiders()
      .then(res => setRiders(res?.riders || res?.data?.riders || []))
      .catch(() => toast.error('Failed to load riders'))
      .finally(() => setLoading(false));
  }, []);

  const handleAssign = async () => {
    if (!selected) return toast.error('Select a rider');
    setAssigning(true);
    try {
      await assignRider(order.id, selected.userId);
      toast.success(`${selected.user?.name || 'Rider'} assigned!`);
      onAssigned(); onClose();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setAssigning(false); }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{ backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Assign Rider</h2>
            <p className="text-sm text-gray-500 mt-0.5">Order #{order.id} · ₹{parseFloat(order.totalAmount).toFixed(2)}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">✕</button>
        </div>
        <div className="p-6">
          {loading ? <div className="text-center py-8"><div className="spinner mx-auto" style={{width:32,height:32}}/></div>
           : riders.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">😴</div>
              <p className="font-medium text-gray-700">No riders online right now</p>
            </div>
           ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {riders.map(r => (
                <div key={r.userId} onClick={() => setSelected(r)}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${selected?.userId === r.userId ? 'border-[var(--coral)] bg-[var(--coral-bg)]' : 'border-gray-100 hover:border-gray-300'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[var(--coral-bg)] rounded-full flex items-center justify-center text-lg">{VEHICLE_ICON[r.vehicleType] || '🛵'}</div>
                    <div>
                      <p className="font-semibold text-gray-900">{r.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">📞 {r.user?.phone || 'No phone'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-yellow-600">⭐ {parseFloat(r.rating || 5).toFixed(1)}</p>
                    <div className="flex items-center gap-1 justify-end mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      <span className="text-xs text-gray-400">Online</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {selected && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">
              Assigning <strong>{selected.user?.name}</strong> · earns <strong>₹{(parseFloat(order.totalAmount)*0.10).toFixed(2)}</strong>
            </div>
          )}
        </div>
        <div className="flex gap-3 p-6 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={handleAssign} disabled={!selected || assigning}
            className="flex-1 py-2.5 bg-[var(--coral)] hover:opacity-90 text-white font-semibold rounded-xl disabled:opacity-60">
            {assigning ? 'Assigning...' : 'Assign Rider'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Order Row ────────────────────────────────────────────────────────────────
const OrderRow = ({ order, onStatusUpdate, onAssignRider }) => {
  const [updating, setUpdating] = useState(false);
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const next = NEXT_STATUS[order.status];

  const advance = async () => {
    if (!next) return;
    setUpdating(true);
    try { await updateOrderStatus(order.id, next); toast.success(`#${order.id} → ${next}`); onStatusUpdate(); }
    catch { toast.error('Failed'); } finally { setUpdating(false); }
  };

  const totalItems = order.orderItems?.reduce((s, i) => s + i.quantity, 0) || order.items?.length || 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex flex-wrap items-start gap-4 justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="font-bold text-gray-900 text-base">Order #{order.id}</span>
            <span style={{ background: cfg.badge, color: cfg.text, padding: '2px 10px', borderRadius: 'var(--r-full)', fontSize: '0.72rem', fontWeight: 700 }}>{cfg.label}</span>
            {order.riderId && <span style={{ background: '#EEF2FF', color: '#4F46E5', padding: '2px 10px', borderRadius: 'var(--r-full)', fontSize: '0.72rem', fontWeight: 600 }}>🛵 Rider Assigned</span>}
          </div>
          <p className="text-sm text-gray-700 font-medium">👤 {order.user?.name || order.customerName || '—'}</p>
          <p className="text-sm text-gray-500 mt-0.5 truncate">📍 {order.deliveryAddress}</p>
          <div className="flex gap-4 mt-1.5 text-sm text-gray-500 flex-wrap">
            <span className="font-semibold text-[var(--coral)]">₹{parseFloat(order.totalAmount).toFixed(2)}</span>
            <span>📦 {totalItems} item{totalItems !== 1 ? 's' : ''}</span>
            <span>🕐 {new Date(order.createdAt).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</span>
            {order.phoneNumber && <span>📞 {order.phoneNumber}</span>}
          </div>
          {order.notes && <p className="text-xs text-gray-400 mt-1 italic">📝 {order.notes}</p>}
        </div>

        <div className="flex flex-col gap-2 flex-shrink-0">
          {next && (
            <button onClick={advance} disabled={updating}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg disabled:opacity-60 whitespace-nowrap">
              {updating ? '...' : `Mark ${next.charAt(0).toUpperCase() + next.slice(1)}`}
            </button>
          )}
          {order.status === 'ready' && !order.riderId && (
            <button onClick={() => onAssignRider(order)}
              className="px-4 py-2 bg-[var(--coral)] hover:opacity-90 text-white text-sm font-semibold rounded-lg flex items-center gap-1.5">
              🛵 Assign Rider
            </button>
          )}
          {order.status === 'out_for_delivery' && <span className="px-4 py-2 text-center text-sm text-cyan-700 bg-cyan-50 rounded-lg border border-cyan-200">🛵 En Route</span>}
          {order.status === 'delivered'         && <span className="px-4 py-2 text-center text-sm text-green-700 bg-green-50 rounded-lg border border-green-200">✅ Delivered</span>}
          {order.status === 'cancelled'         && <span className="px-4 py-2 text-center text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">❌ Cancelled</span>}
        </div>
      </div>
    </div>
  );
};

// ── Main ManageOrders ────────────────────────────────────────────────────────
const ManageOrders = () => {
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all');
  const [search,   setSearch]   = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');
  const [assigning, setAssigning] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await getAllOrders();
      setOrders(res.data?.orders || res.data || []);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchOrders();
    const t = setInterval(fetchOrders, 15000);
    return () => clearInterval(t);
  }, []);

  const statusCounts = useMemo(() => orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1; return acc;
  }, {}), [orders]);

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = filter === 'all' ? orders : orders.filter(o => o.status === filter);

    // Search by order ID, customer name, phone, address
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(o =>
        String(o.id).includes(q) ||
        (o.user?.name || '').toLowerCase().includes(q) ||
        (o.phoneNumber || '').includes(q) ||
        (o.deliveryAddress || '').toLowerCase().includes(q)
      );
    }

    // Date range
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      list = list.filter(o => new Date(o.createdAt) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      list = list.filter(o => new Date(o.createdAt) <= to);
    }

    // Sort: active first, then newest
    return [...list].sort((a, b) => {
      const terminal = ['delivered', 'cancelled'];
      const aT = terminal.includes(a.status), bT = terminal.includes(b.status);
      if (aT !== bT) return aT ? 1 : -1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [orders, filter, search, dateFrom, dateTo]);

  const clearFilters = () => { setSearch(''); setDateFrom(''); setDateTo(''); setFilter('all'); };
  const hasFilters = search || dateFrom || dateTo || filter !== 'all';

  const STATUS_TABS = ['all','pending','confirmed','preparing','ready','out_for_delivery','delivered','cancelled'];

  return (
    <div className="page page-wide fade-up">

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <h1>Manage Orders</h1>
          <p style={{ color:'var(--ink-50)', fontSize:'0.875rem', marginTop:'0.2rem' }}>
            {orders.length} total · auto-refreshes every 15s
          </p>
        </div>
        <button onClick={fetchOrders} className="btn btn-outline btn-sm">↻ Refresh</button>
      </div>

      {/* Summary cards */}
      <div className="grid-4 fade-up-1" style={{ marginBottom:'1.5rem' }}>
        {[
          { label:'Active',    value:(statusCounts.pending||0)+(statusCounts.confirmed||0)+(statusCounts.preparing||0), color:'#1D4ED8' },
          { label:'Ready',     value:statusCounts.ready||0,            color:'#C2410C' },
          { label:'En Route',  value:statusCounts.out_for_delivery||0, color:'#0891B2' },
          { label:'Delivered', value:statusCounts.delivered||0,        color:'#16A34A' },
        ].map(c => (
          <div key={c.label} className="stat-card">
            <div className="stat-label">{c.label}</div>
            <div className="stat-value" style={{ color:c.color, fontSize:'2rem' }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Search + date filters */}
      <div className="card" style={{ padding:'1rem 1.25rem', marginBottom:'1rem' }}>
        <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap', alignItems:'center' }}>
          {/* Search */}
          <div style={{ flex:'1', minWidth:200, position:'relative' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--ink-30)', pointerEvents:'none' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by order #, customer name, phone, address..."
              className="input" style={{ paddingLeft:34, fontSize:'0.875rem' }} />
          </div>

          {/* Date from */}
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <label style={{ fontSize:'0.78rem', color:'var(--ink-50)', whiteSpace:'nowrap' }}>From</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="input" style={{ width:150, fontSize:'0.875rem' }} />
          </div>

          {/* Date to */}
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <label style={{ fontSize:'0.78rem', color:'var(--ink-50)', whiteSpace:'nowrap' }}>To</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="input" style={{ width:150, fontSize:'0.875rem' }} />
          </div>

          {/* Clear */}
          {hasFilters && (
            <button onClick={clearFilters} className="btn btn-ghost btn-sm" style={{ whiteSpace:'nowrap' }}>
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="card" style={{ padding:'0.5rem 0.75rem', marginBottom:'1rem', overflowX:'auto' }}>
        <div style={{ display:'flex', gap:'0.25rem', flexWrap:'nowrap' }}>
          {STATUS_TABS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding:'0.4rem 0.85rem', borderRadius:'var(--r-md)',
                fontSize:'0.78rem', fontWeight:600, whiteSpace:'nowrap', cursor:'pointer',
                border:'none', fontFamily:'var(--font-body)',
                background: filter === f ? 'var(--coral)' : 'transparent',
                color:      filter === f ? 'white'       : 'var(--ink-50)',
                transition: 'all 0.15s',
              }}>
              {f === 'all'
                ? `All (${orders.length})`
                : `${STATUS_CONFIG[f]?.label || f} (${statusCounts[f] || 0})`}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {hasFilters && (
        <p style={{ fontSize:'0.82rem', color:'var(--ink-50)', marginBottom:'0.75rem' }}>
          Showing {filtered.length} of {orders.length} orders
          {search && <> matching "<strong>{search}</strong>"</>}
        </p>
      )}

      {/* Orders list */}
      {loading ? (
        <div style={{ textAlign:'center', padding:'4rem', color:'var(--ink-50)' }}>
          <div className="spinner" style={{ width:32, height:32, margin:'0 auto 1rem' }} />
          Loading orders...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign:'center', padding:'4rem' }}>
          <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>📦</div>
          <h3 style={{ marginBottom:'0.5rem' }}>No orders found</h3>
          <p style={{ color:'var(--ink-50)', fontSize:'0.875rem' }}>
            {hasFilters ? 'Try adjusting your search or filters' : 'Orders will appear here when customers place them'}
          </p>
          {hasFilters && <button onClick={clearFilters} className="btn btn-outline btn-sm" style={{ marginTop:'1rem' }}>Clear Filters</button>}
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
          {filtered.map(o => (
            <OrderRow key={o.id} order={o} onStatusUpdate={fetchOrders} onAssignRider={setAssigning} />
          ))}
        </div>
      )}

      {assigning && (
        <AssignRiderModal order={assigning} onClose={() => setAssigning(null)} onAssigned={fetchOrders} />
      )}
    </div>
  );
};

export default ManageOrders;