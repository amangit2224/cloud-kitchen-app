import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllOrders } from '../services/orderService';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getAllOrders();
      console.log('Order response:', response);
      
      // FIX: Handle different response structures
      // Your backend returns: { success: true, data: { orders: [...] } }
      const orders = response.data?.orders || response.data?.data?.orders || [];
      setOrders(orders);
      setError('');
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      preparing: 'bg-purple-100 text-purple-800 border-purple-200',
      ready: 'bg-green-100 text-green-800 border-green-200',
      delivered: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      confirmed: '✅',
      preparing: '👨‍🍳',
      ready: '📦',
      delivered: '🎉',
      cancelled: '❌'
    };
    return icons[status] || '📋';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg inline-block">
            {error}
            <button
              onClick={fetchOrders}
              className="ml-4 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-8xl mb-6">📦</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">No Orders Yet</h2>
          <p className="text-gray-600 mb-8">Start ordering some delicious food!</p>
          <Link to="/menu">
            <Button variant="primary" size="lg">
              Browse Menu
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">My Orders</h1>
          <Link to="/menu">
            <Button variant="outline">
              Order Again
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                {/* Order Header */}
                <div className="flex flex-wrap justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                      Order #{order.id}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary-600">
                        ₹{parseFloat(order.totalAmount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t border-b py-4 my-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Items ({order.orderItems?.length || 0}):
                  </p>
                  <div className="space-y-2">
                    {order.orderItems?.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <div className="flex items-center space-x-3">
                          <span className="text-gray-500">×{item.quantity}</span>
                          <span className="text-gray-800">{item.menuItem?.name || 'Item'}</span>
                        </div>
                        <span className="text-gray-600 font-medium">
                          ₹{parseFloat(item.subtotal).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">Delivery Address:</p>
                    <p className="text-gray-800 font-medium">{order.deliveryAddress || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Phone:</p>
                    <p className="text-gray-800 font-medium">{order.phoneNumber}</p>
                  </div>
                  {order.notes && (
                    <div className="md:col-span-2">
                      <p className="text-gray-500 mb-1">Notes:</p>
                      <p className="text-gray-800 italic">{order.notes}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-wrap gap-3">
                  {(order.status === 'pending' || order.status === 'confirmed' || order.status === 'preparing' || order.status === 'ready') && (
                    <Link to={`/orders/${order.id}`}>
                      <Button variant="primary" size="sm">
                        Track Order
                      </Button>
                    </Link>
                  )}
                  <Link to={`/orders/${order.id}`}>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;