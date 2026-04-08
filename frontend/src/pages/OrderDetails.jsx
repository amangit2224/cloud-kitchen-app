import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getOrderById, cancelOrder } from '../services/orderService';
import { createReview, getOrderReview } from '../services/reviewService';
import StarRating from '../components/common/StarRating';

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS_STEPS = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];

const STATUS_INFO = {
  pending:          { label: 'Order Placed',       icon: '🕐', color: 'text-yellow-600',  desc: 'Your order has been received' },
  confirmed:        { label: 'Confirmed',           icon: '✅', color: 'text-blue-600',    desc: 'Restaurant confirmed your order' },
  preparing:        { label: 'Being Prepared',      icon: '👨‍🍳', color: 'text-purple-600',  desc: 'Kitchen is preparing your food' },
  ready:            { label: 'Ready for Pickup',    icon: '📦', color: 'text-orange-600',  desc: 'Food is ready, finding a rider' },
  out_for_delivery: { label: 'Out for Delivery',    icon: '🛵', color: 'text-cyan-600',    desc: 'Your rider is on the way!' },
  delivered:        { label: 'Delivered',           icon: '🎉', color: 'text-green-600',   desc: 'Enjoy your meal!' },
  cancelled:        { label: 'Cancelled',           icon: '❌', color: 'text-red-600',     desc: 'This order was cancelled' },
};

const VEHICLE_ICON = { bicycle: '🚲', motorcycle: '🛵', car: '🚗' };

// ── Progress Bar ───────────────────────────────────────────────────────────────
const OrderProgress = ({ status }) => {
  if (status === 'cancelled') return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
      <span className="text-2xl">❌</span>
      <p className="font-semibold text-red-700 mt-1">Order Cancelled</p>
    </div>
  );

  const currentIdx = STATUS_STEPS.indexOf(status);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-semibold text-gray-900 mb-5">Order Progress</h3>
      <div className="relative">
        {/* Progress line */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200" />
        <div
          className="absolute top-4 left-4 h-0.5 bg-rose-400 transition-all duration-500"
          style={{ width: currentIdx > 0 ? `${(currentIdx / (STATUS_STEPS.length - 1)) * 100}%` : '0%' }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {STATUS_STEPS.map((step, idx) => {
            const info = STATUS_INFO[step];
            const done = idx <= currentIdx;
            const active = idx === currentIdx;
            return (
              <div key={step} className="flex flex-col items-center gap-2" style={{ width: `${100 / STATUS_STEPS.length}%` }}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                  done ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white border-gray-300 text-gray-400'
                } ${active ? 'ring-4 ring-rose-100 scale-110' : ''}`}>
                  {done ? (active ? info.icon : '✓') : idx + 1}
                </div>
                <p className={`text-xs text-center leading-tight hidden sm:block ${done ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                  {info.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current status message */}
      {STATUS_INFO[status] && (
        <div className="mt-6 text-center">
          <p className={`text-lg font-bold ${STATUS_INFO[status].color}`}>
            {STATUS_INFO[status].icon} {STATUS_INFO[status].label}
          </p>
          <p className="text-gray-500 text-sm mt-1">{STATUS_INFO[status].desc}</p>
        </div>
      )}
    </div>
  );
};

// ── Rider Info Card (shown to customer once assigned) ─────────────────────────
const RiderInfoCard = ({ order }) => {
  if (!order.rider) return null;

  const statusMessages = {
    ready:            '📦 Your rider has been assigned and is heading to pick up your order.',
    out_for_delivery: '🛵 Your rider has picked up your food and is on the way!',
    delivered:        '✅ Your rider completed the delivery.',
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-5">
      <h3 className="font-semibold text-gray-900 mb-3">
        {order.status === 'out_for_delivery' ? '🛵 Your Rider is On the Way!' : '🛵 Rider Assigned'}
      </h3>

      <p className="text-sm text-indigo-700 mb-4">{statusMessages[order.status]}</p>

      <div className="flex items-center gap-4 bg-white rounded-xl p-4 border border-indigo-100">
        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-2xl">
          {VEHICLE_ICON[order.rider.vehicleType] || '🛵'}
        </div>
        <div className="flex-1">
          <p className="font-bold text-gray-900">{order.rider.name}</p>
          <div className="flex items-center gap-3 mt-1">
            {order.rider.rating && (
              <span className="text-xs text-yellow-600">⭐ {parseFloat(order.rider.rating).toFixed(1)}</span>
            )}
            {order.rider.vehicleType && (
              <span className="text-xs text-gray-500 capitalize">{order.rider.vehicleType}</span>
            )}
          </div>
        </div>
        {order.rider.phone && (
          <a
            href={`tel:${order.rider.phone}`}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            📞 Call
          </a>
        )}
      </div>
    </div>
  );
};

// ── Review Modal ───────────────────────────────────────────────────────────────
const ReviewModal = ({ order, onClose, onReviewSubmitted }) => {
  const [rating, setRating]   = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!rating) return toast.error('Please select a rating');
    setLoading(true);
    try {
      await createReview({ orderId: order.id, rating, comment });
      toast.success('Review submitted! Thank you.');
      onReviewSubmitted();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Rate Your Order</h2>
        <div className="flex justify-center mb-4">
          <StarRating rating={rating} onChange={setRating} size="lg" />
        </div>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Share your experience (optional)..."
          rows={3}
          className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
        />
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-60">
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Cancel Modal ───────────────────────────────────────────────────────────────
const CancelModal = ({ order, onClose, onCancelled }) => {
  const REASONS = ['Changed my mind', 'Ordered by mistake', 'Taking too long', 'Found better option', 'Other'];
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!reason) return toast.error('Please select a reason');
    setLoading(true);
    try {
      await cancelOrder(order.id, reason);
      toast.success('Order cancelled successfully');
      onCancelled();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Cancel Order</h2>
        <p className="text-sm text-gray-500 mb-4">Please select a reason for cancellation</p>
        <div className="space-y-2 mb-4">
          {REASONS.map(r => (
            <label key={r} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${reason === r ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} className="accent-red-500" />
              <span className="text-sm text-gray-700">{r}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">Keep Order</button>
          <button onClick={handleCancel} disabled={loading} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-60">
            {loading ? 'Cancelling...' : 'Cancel Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main OrderDetails ──────────────────────────────────────────────────────────
const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder]           = useState(null);
  const [review, setReview]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      const res = await getOrderById(id);
      setOrder(res.data.order || res.data);
    } catch {
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchReview = useCallback(async () => {
    try {
      const res = await getOrderReview(id);
      setReview(res.data.review);
    } catch {
      // No review yet — that's fine
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
    fetchReview();

    // ✅ AUTO-REFRESH every 5 seconds for live status updates
    const interval = setInterval(() => {
      fetchOrder();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchOrder, fetchReview]);

  // Stop polling once delivered or cancelled
  useEffect(() => {
    if (order?.status === 'delivered' || order?.status === 'cancelled') {
      // No need to keep polling for terminal states
    }
  }, [order?.status]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl animate-spin mb-3">🍽️</div>
        <p className="text-gray-500">Loading order details...</p>
      </div>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-3">❓</div>
        <p className="text-gray-600">Order not found</p>
        <button onClick={() => navigate('/orders')} className="mt-4 text-rose-500 hover:underline text-sm">Back to orders</button>
      </div>
    </div>
  );

  const canCancel = ['pending', 'confirmed'].includes(order.status);
  const canReview = order.status === 'delivered' && !review;

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Back + Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/orders')} className="p-2 hover:bg-white rounded-lg transition-colors text-gray-500 border border-gray-200">←</button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Order #{order.id}</h1>
            <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Progress Tracker */}
          <OrderProgress status={order.status} />

          {/* 🆕 Rider Info (shows once a rider is assigned) */}
          {order.rider && ['ready', 'out_for_delivery', 'delivered'].includes(order.status) && (
            <RiderInfoCard order={order} />
          )}

          {/* Order Items */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.items?.map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{item.menuItem?.name || item.name}</p>
                    <p className="text-sm text-gray-400">× {item.quantity} · ₹{parseFloat(item.price).toFixed(2)} each</p>
                  </div>
                  <p className="font-semibold text-gray-900">₹{parseFloat(item.subtotal).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between font-bold text-gray-900">
              <span>Total</span>
              <span>₹{parseFloat(order.totalAmount).toFixed(2)}</span>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Delivery Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="text-gray-400">📍</span>
                <span className="text-gray-700">{order.deliveryAddress}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-400">📞</span>
                <span className="text-gray-700">{order.phoneNumber}</span>
              </div>
              {order.notes && (
                <div className="flex gap-2">
                  <span className="text-gray-400">📝</span>
                  <span className="text-gray-700">{order.notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Existing review */}
          {review && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Your Review</h3>
              <StarRating rating={review.rating} readonly size="md" />
              {review.comment && <p className="text-sm text-gray-600 mt-2">{review.comment}</p>}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {canCancel && (
              <button
                onClick={() => setShowCancel(true)}
                className="flex-1 py-3 border-2 border-red-200 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-colors"
              >
                Cancel Order
              </button>
            )}
            {canReview && (
              <button
                onClick={() => setShowReview(true)}
                className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl transition-colors"
              >
                ⭐ Rate Order
              </button>
            )}
          </div>

          {/* Live refresh indicator */}
          {!['delivered', 'cancelled'].includes(order.status) && (
            <p className="text-center text-xs text-gray-400">🔄 Status updates automatically every 5 seconds</p>
          )}
        </div>
      </div>

      {showReview && <ReviewModal order={order} onClose={() => setShowReview(false)} onReviewSubmitted={fetchReview} />}
      {showCancel && <CancelModal order={order} onClose={() => setShowCancel(false)} onCancelled={fetchOrder} />}
    </div>
  );
};

export default OrderDetails;