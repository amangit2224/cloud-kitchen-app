import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getAvailableRiders, assignRider } from '../../services/riderService';

// ── Import your existing order service ──
import { getAllOrders, updateOrderStatus } from '../../services/orderService';

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:          { color: 'bg-yellow-100 text-yellow-800',  label: 'Pending' },
  confirmed:        { color: 'bg-blue-100 text-blue-800',      label: 'Confirmed' },
  preparing:        { color: 'bg-purple-100 text-purple-800',  label: 'Preparing' },
  ready:            { color: 'bg-orange-100 text-orange-800',  label: 'Ready' },
  out_for_delivery: { color: 'bg-cyan-100 text-cyan-800',      label: 'Out for Delivery' },
  delivered:        { color: 'bg-green-100 text-green-800',    label: 'Delivered' },
  cancelled:        { color: 'bg-red-100 text-red-800',        label: 'Cancelled' },
};

const NEXT_STATUS = {
  pending:   'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
  // 'ready' → handled by rider assignment, not direct status change
};

const VEHICLE_ICON = { bicycle: '🚲', motorcycle: '🛵', car: '🚗' };

// ── Assign Rider Modal ─────────────────────────────────────────────────────────
const AssignRiderModal = ({ order, onClose, onAssigned }) => {
  const [riders, setRiders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [assigning, setAssigning]   = useState(false);
  const [selectedRider, setSelected] = useState(null);

  useEffect(() => {
    getAvailableRiders()
      .then(res => {
        // Handle both response structures
        const ridersList = res?.riders || res?.data?.riders || [];
        setRiders(ridersList);
      })
      .catch((err) => {
        console.error('Error loading riders:', err);
        toast.error('Failed to load available riders');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAssign = async () => {
    if (!selectedRider) return toast.error('Please select a rider');
    setAssigning(true);
    try {
      await assignRider(order.id, selectedRider.userId);
      toast.success(`${selectedRider.user?.name || 'Rider'} assigned successfully!`);
      onAssigned();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Assign Rider</h2>
            <p className="text-sm text-gray-500 mt-0.5">Order #{order.id} · ₹{parseFloat(order.totalAmount).toFixed(2)}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">✕</button>
        </div>

        {/* Body */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-400">
              <div className="spinner mx-auto mb-3" style={{ width: 32, height: 32 }} />
              <p>Loading available riders...</p>
            </div>
          ) : riders.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">😴</div>
              <p className="font-medium text-gray-700">No riders online right now</p>
              <p className="text-sm text-gray-400 mt-1">Riders need to be approved and go online to appear here</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              <p className="text-sm text-gray-500 mb-3">{riders.length} rider(s) available — select one:</p>
              {riders.map(rider => (
                <div
                  key={rider.userId}
                  onClick={() => setSelected(rider)}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedRider?.userId === rider.userId
                      ? 'border-rose-400 bg-rose-50'
                      : 'border-gray-100 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-lg">
                      {VEHICLE_ICON[rider.vehicleType] || '🛵'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{rider.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">📞 {rider.user?.phone || 'No phone'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-yellow-600">⭐ {parseFloat(rider.rating || 5).toFixed(1)}</p>
                    <div className="flex items-center gap-1 justify-end mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      <span className="text-xs text-gray-400">Online</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedRider && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">
              Assigning <strong>{selectedRider.user?.name}</strong> · they earn <strong>₹{(parseFloat(order.totalAmount) * 0.10).toFixed(2)}</strong>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedRider || assigning}
            className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-60"
          >
            {assigning ? 'Assigning...' : 'Assign Rider'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Order Row ──────────────────────────────────────────────────────────────────
const OrderRow = ({ order, onStatusUpdate, onAssignRider }) => {
  const [updating, setUpdating] = useState(false);
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const nextStatus = NEXT_STATUS[order.status];

  const handleStatusUpdate = async () => {
    if (!nextStatus) return;
    setUpdating(true);
    try {
      await updateOrderStatus(order.id, nextStatus);
      toast.success(`Order #${order.id} → ${nextStatus}`);
      onStatusUpdate();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex flex-wrap items-start gap-4 justify-between">

        {/* Order Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-bold text-gray-900">Order #{order.id}</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
              {cfg.label}
            </span>
            {order.riderId && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                🛵 Rider Assigned
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">👤 {order.user?.name || order.customerName}</p>
          <p className="text-sm text-gray-500 mt-0.5">📍 {order.deliveryAddress}</p>
          <div className="flex gap-4 mt-2 text-sm text-gray-500">
            <span>💰 ₹{parseFloat(order.totalAmount).toFixed(2)}</span>
            <span>📦 {order.items?.length || 0} item(s)</span>
            <span>🕐 {new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          {order.riderName && (
            <p className="text-sm text-indigo-600 mt-1">🛵 Rider: {order.riderName}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          {/* Advance status button (pending → confirmed → preparing) */}
          {nextStatus && (
            <button
              onClick={handleStatusUpdate}
              disabled={updating}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60 whitespace-nowrap"
            >
              {updating ? 'Updating...' : `Mark ${nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}`}
            </button>
          )}

          {/* Mark Ready button (preparing → ready) */}
          {order.status === 'preparing' && (
            <button
              onClick={async () => {
                setUpdating(true);
                try {
                  await updateOrderStatus(order.id, 'ready');
                  toast.success(`Order #${order.id} marked Ready for pickup!`);
                  onStatusUpdate();
                } catch { toast.error('Failed'); }
                finally { setUpdating(false); }
              }}
              disabled={updating}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
            >
              Mark Ready
            </button>
          )}

          {/* Assign Rider button — shows when order is ready and no rider yet */}
          {order.status === 'ready' && !order.riderId && (
            <button
              onClick={() => onAssignRider(order)}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            >
              🛵 Assign Rider
            </button>
          )}

          {/* Status labels for terminal states */}
          {order.status === 'out_for_delivery' && (
            <span className="px-4 py-2 text-center text-sm text-cyan-700 bg-cyan-50 rounded-lg border border-cyan-200">
              🛵 Rider En Route
            </span>
          )}
          {order.status === 'delivered' && (
            <span className="px-4 py-2 text-center text-sm text-green-700 bg-green-50 rounded-lg border border-green-200">
              ✅ Delivered
            </span>
          )}
          {order.status === 'cancelled' && (
            <span className="px-4 py-2 text-center text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
              ❌ Cancelled
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main ManageOrders ──────────────────────────────────────────────────────────
const ManageOrders = () => {
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState('all');
  const [assigningOrder, setAssigning] = useState(null); // order to assign rider to

  const fetchOrders = async () => {
    try {
      const res = await getAllOrders();
      // Normalize — handle both response shapes
      const raw = res.data.orders || res.data || [];
      setOrders(raw);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Auto-refresh every 15 seconds
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  // Sort: active first (non-delivered, non-cancelled), then by date desc
  const sorted = [...filtered].sort((a, b) => {
    const terminal = ['delivered', 'cancelled'];
    const aTerminal = terminal.includes(a.status);
    const bTerminal = terminal.includes(b.status);
    if (aTerminal !== bTerminal) return aTerminal ? 1 : -1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const FILTERS = ['all', 'pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Orders</h1>
            <p className="text-gray-500 text-sm mt-1">Auto-refreshes every 15 seconds</p>
          </div>
          <button onClick={fetchOrders} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
            🔄 Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Active',      value: (statusCounts.pending || 0) + (statusCounts.confirmed || 0) + (statusCounts.preparing || 0), color: 'text-blue-600' },
            { label: 'Ready',       value: statusCounts.ready || 0,            color: 'text-orange-600' },
            { label: 'En Route',    value: statusCounts.out_for_delivery || 0, color: 'text-cyan-600' },
            { label: 'Delivered',   value: statusCounts.delivered || 0,        color: 'text-green-600' },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500">{c.label}</p>
              <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-4 overflow-x-auto">
          <div className="flex gap-1 p-2">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  filter === f ? 'bg-rose-50 text-rose-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {f === 'all' ? `All (${orders.length})` : `${f.replace('_', ' ')} (${statusCounts[f] || 0})`}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading orders...</div>
        ) : sorted.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <div className="text-4xl mb-3">📦</div>
            <p className="text-gray-500">No {filter === 'all' ? '' : filter} orders found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map(order => (
              <OrderRow
                key={order.id}
                order={order}
                onStatusUpdate={fetchOrders}
                onAssignRider={setAssigning}
              />
            ))}
          </div>
        )}
      </div>

      {/* Assign Rider Modal */}
      {assigningOrder && (
        <AssignRiderModal
          order={assigningOrder}
          onClose={() => setAssigning(null)}
          onAssigned={fetchOrders}
        />
      )}
    </div>
  );
};

export default ManageOrders;