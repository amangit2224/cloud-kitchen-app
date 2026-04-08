import React, { useEffect, useState } from 'react';
import { useSocket } from '../../context/SocketContext';

const STEPS = [
  { key: 'pending',          label: 'Order Placed',   icon: '🧾' },
  { key: 'confirmed',        label: 'Confirmed',       icon: '✅' },
  { key: 'preparing',        label: 'Preparing',       icon: '👨‍🍳' },
  { key: 'ready',            label: 'Ready',           icon: '📦' },
  { key: 'out_for_delivery', label: 'On The Way',      icon: '🛵' },
  { key: 'delivered',        label: 'Delivered',       icon: '🎉' },
];

const STATUS_INDEX = {
  pending: 0, confirmed: 1, preparing: 2,
  ready: 3, out_for_delivery: 4, delivered: 5,
};

const LiveOrderTracker = ({ order }) => {
  const { getOrderStatus } = useSocket();
  const liveUpdate = getOrderStatus(order.id);

  // Use live status if available, else fall back to order prop
  const currentStatus = liveUpdate?.status || order.status;
  const currentIndex = STATUS_INDEX[currentStatus] ?? 0;
  const isCancelled = currentStatus === 'cancelled';

  const [pulse, setPulse] = useState(false);

  // Pulse animation when status changes
  useEffect(() => {
    if (liveUpdate) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 1000);
      return () => clearTimeout(t);
    }
  }, [liveUpdate?.status]);

  if (isCancelled) {
    return (
      <div className="card p-5 border-2 border-red-200 bg-red-50">
        <div className="flex items-center gap-3">
          <span className="text-3xl">❌</span>
          <div>
            <p className="font-bold text-red-700">Order #{order.id} Cancelled</p>
            {order.cancellationReason && (
              <p className="text-sm text-red-500">Reason: {order.cancellationReason}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`card p-5 transition-all duration-500 ${pulse ? 'ring-2 ring-[var(--coral)] ring-offset-2' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-[var(--ink)]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Order #{order.id}
          </h3>
          <p className="text-sm text-gray-500">
            {order.orderItems?.length} item{order.orderItems?.length !== 1 ? 's' : ''} · ₹{parseFloat(order.totalAmount).toFixed(2)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Live indicator */}
          <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block"></span>
            Live
          </span>
          <span className={`badge badge-${currentStatus}`}>
            {currentStatus.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="relative">
        {/* Progress line background */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 z-0 mx-5" />
        {/* Progress line filled */}
        <div
          className="absolute top-5 left-0 h-1 bg-[var(--coral)] z-0 transition-all duration-700 ease-in-out mx-5"
          style={{ width: `${(currentIndex / (STEPS.length - 1)) * 90}%` }}
        />

        {/* Steps */}
        <div className="relative z-10 flex justify-between">
          {STEPS.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            return (
              <div key={step.key} className="flex flex-col items-center gap-1" style={{ minWidth: 48 }}>
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-lg
                  border-2 transition-all duration-500
                  ${isCompleted ? 'bg-[var(--coral)] border-[var(--coral)] text-white' :
                    isCurrent ? 'bg-white border-[var(--coral)] shadow-md scale-110' :
                    'bg-white border-gray-200 text-gray-300'}
                `}>
                  {step.icon}
                </div>
                <span className={`text-xs text-center leading-tight max-w-[56px] ${
                  isCurrent ? 'text-[var(--coral)] font-semibold' :
                  isCompleted ? 'text-gray-600' : 'text-gray-300'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order items summary */}
      {order.orderItems && order.orderItems.length > 0 && (
        <div className="mt-5 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Items</p>
          <div className="space-y-1">
            {order.orderItems.slice(0, 3).map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {item.quantity}× {item.menuItem?.name || 'Item'}
                  {item.specialInstructions && (
                    <span className="text-xs text-gray-400 ml-1">({item.specialInstructions})</span>
                  )}
                </span>
                <span className="text-gray-500">₹{parseFloat(item.subtotal).toFixed(0)}</span>
              </div>
            ))}
            {order.orderItems.length > 3 && (
              <p className="text-xs text-gray-400">+{order.orderItems.length - 3} more items</p>
            )}
          </div>
        </div>
      )}

      {/* Rider info if out for delivery */}
      {(currentStatus === 'out_for_delivery') && (
        <div className="mt-4 p-3 bg-orange-50 rounded-lg flex items-center gap-3">
          <span className="text-2xl">🛵</span>
          <div>
            <p className="text-sm font-semibold text-orange-700">Rider is on the way!</p>
            <p className="text-xs text-orange-500">Your food will arrive shortly</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveOrderTracker;