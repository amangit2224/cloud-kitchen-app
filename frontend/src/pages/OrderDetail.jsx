import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById, cancelOrder } from '../services/orderService';
import { useSocket } from '../context/SocketContext';
import LiveOrderTracker from '../components/order/LiveOrderTracker';
import toast from 'react-hot-toast';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getOrderStatus } = useSocket();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const liveUpdate = order ? getOrderStatus(order.id) : null;
  const currentStatus = liveUpdate?.status || order?.status;

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await getOrderById(id);
        setOrder(res.data);
      } catch {
        toast.error('Order not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }
    setCancelling(true);
    try {
      await cancelOrder(id, cancelReason);
      setOrder(prev => ({ ...prev, status: 'cancelled', cancellationReason: cancelReason }));
      setShowCancelModal(false);
      toast.success('Order cancelled successfully');
    } catch (err) {
      toast.error(err.message || 'Cannot cancel this order');
    } finally {
      setCancelling(false);
    }
  };

  const canCancel = ['pending', 'confirmed'].includes(currentStatus);

  if (loading) {
    return (
      <div className="page min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[var(--coral)] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="page min-h-screen py-10">
      <div className="max-w-2xl mx-auto px-4">

        {/* Back button */}
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-[var(--ink)] mb-6 text-sm transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
          Back to Home
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[var(--ink)]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Order #{order.id}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          {canCancel && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="text-sm text-red-500 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-50 transition"
            >
              Cancel Order
            </button>
          )}
        </div>

        {/* Live Tracker */}
        <LiveOrderTracker order={order} />

        {/* Delivery Address */}
        <div className="card p-5 mt-4">
          <h3 className="font-semibold text-[var(--ink)] mb-3 flex items-center gap-2">
            <span>📍</span> Delivery Address
          </h3>
          <p className="text-gray-600 text-sm">{order.deliveryAddress}</p>
          {order.phoneNumber && <p className="text-gray-400 text-sm mt-1">📞 {order.phoneNumber}</p>}
          {order.notes && <p className="text-gray-400 text-sm mt-1 italic">📝 {order.notes}</p>}
        </div>

        {/* Price Breakdown */}
        <div className="card p-5 mt-4">
          <h3 className="font-semibold text-[var(--ink)] mb-3 flex items-center gap-2">
            <span>💰</span> Payment Details
          </h3>
          <div className="space-y-2 text-sm">
            {order.orderItems?.map(item => (
              <div key={item.id} className="flex justify-between text-gray-600">
                <span>{item.quantity}× {item.menuItem?.name}</span>
                <span>₹{parseFloat(item.subtotal).toFixed(0)}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-[var(--ink)]">
              <span>Total Paid</span>
              <span>₹{parseFloat(order.totalAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-[var(--ink)] mb-2">Cancel Order?</h3>
            <p className="text-sm text-gray-400 mb-4">This action cannot be undone. Please tell us why you're cancelling.</p>

            <div className="space-y-2 mb-4">
              {['Changed my mind', 'Ordered by mistake', 'Taking too long', 'Other'].map(reason => (
                <button
                  key={reason}
                  onClick={() => setCancelReason(reason)}
                  className={`w-full text-left px-4 py-2 rounded-xl text-sm border transition ${cancelReason === reason ? 'border-[var(--coral)] bg-red-50 text-[var(--coral)]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                >
                  {reason}
                </button>
              ))}
              <input
                type="text"
                placeholder="Or type your own reason..."
                value={['Changed my mind', 'Ordered by mistake', 'Taking too long', 'Other'].includes(cancelReason) ? '' : cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[var(--coral)]"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowCancelModal(false)} className="flex-1 btn btn-outline">Keep Order</button>
              <button onClick={handleCancel} disabled={cancelling || !cancelReason.trim()} className="flex-1 btn bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 transition">
                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;