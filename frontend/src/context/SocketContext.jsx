import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

const STATUS_MESSAGES = {
  pending:          '⏳ Order received! Waiting for confirmation.',
  confirmed:        '✅ Order confirmed! Kitchen is getting ready.',
  preparing:        '👨‍🍳 Your food is being prepared!',
  ready:            '📦 Order is packed and ready for pickup!',
  out_for_delivery: '🛵 Rider is on the way with your order!',
  delivered:        '🎉 Order delivered! Enjoy your meal!',
  cancelled:        '❌ Your order has been cancelled.',
};

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const [orderUpdates, setOrderUpdates] = useState({}); // { orderId: { status, ... } }
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Connect to socket server
    const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      console.log('🔌 Socket connected');

      // Join appropriate room based on role
      if (user.role === 'customer') {
        socket.emit('join', user.id);
      } else if (user.role === 'admin') {
        socket.emit('joinAdmin');
      } else if (user.role === 'rider') {
        socket.emit('joinRider', user.id);
      }
    });

    socket.on('disconnect', () => {
      setConnected(false);
      console.log('❌ Socket disconnected');
    });

    // ── Order status updated ───────────────────────────────────────────
    socket.on('orderStatusUpdated', (data) => {
      const { orderId, status } = data;

      setOrderUpdates(prev => ({
        ...prev,
        [orderId]: { ...prev[orderId], ...data }
      }));

      // Show toast to customer
      if (user.role === 'customer') {
        const message = STATUS_MESSAGES[status];
        if (message) {
          if (status === 'delivered') {
            toast.success(message, { duration: 5000, icon: '🎉' });
          } else if (status === 'cancelled') {
            toast.error(message, { duration: 5000 });
          } else {
            toast(message, { duration: 4000, icon: '📋' });
          }
        }
      }

      // Show toast to admin
      if (user.role === 'admin') {
        toast(`Order #${orderId} → ${status}`, { icon: '📦', duration: 3000 });
      }
    });

    // ── New order arrived (admin only) ─────────────────────────────────
    socket.on('newOrder', (data) => {
      if (user.role === 'admin') {
        toast.success(`🆕 New order #${data.orderId} — ₹${data.totalAmount}`, {
          duration: 5000,
        });
      }
    });

    // ── Order cancelled ────────────────────────────────────────────────
    socket.on('orderCancelled', (data) => {
      const { orderId } = data;
      setOrderUpdates(prev => ({
        ...prev,
        [orderId]: { ...prev[orderId], status: 'cancelled' }
      }));

      if (user.role === 'admin') {
        toast.error(`Order #${orderId} was cancelled`, { duration: 4000 });
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [isAuthenticated, user]);

  const getOrderStatus = (orderId) => orderUpdates[orderId];

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, orderUpdates, getOrderStatus }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);