import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/orderService';
import { getAddresses } from '../services/userService';
import PaymentButton from '../components/PaymentButton';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const Checkout = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [form, setForm] = useState({
    deliveryAddress: '',
    phoneNumber: user?.phone || '',
    notes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  // Fetch saved addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await getAddresses();
        const addrList = res.data?.addresses || res.addresses || [];
        setAddresses(addrList);
        
        // Find default address
        const defaultAddr = addrList.find(addr => addr.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
          setForm(prev => ({
            ...prev,
            deliveryAddress: defaultAddr.address,
            phoneNumber: defaultAddr.phone || user?.phone || '',
          }));
        }
      } catch (error) {
        console.error('Failed to load addresses:', error);
      } finally {
        setLoadingAddresses(false);
      }
    };
    fetchAddresses();
  }, [user]);

  const handleAddressSelect = (address) => {
    setSelectedAddressId(address.id);
    setForm(prev => ({
      ...prev,
      deliveryAddress: address.address,
      phoneNumber: address.phone || user?.phone || '',
    }));
  };

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePlaceOrder = async () => {
    if (!form.deliveryAddress.trim()) {
      toast.error('Please enter a delivery address');
      return;
    }
    if (!form.phoneNumber.trim()) {
      toast.error('Please enter a phone number');
      return;
    }
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({
          menuItemId: item.id,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions || '',
        })),
        deliveryAddress: form.deliveryAddress,
        phoneNumber: form.phoneNumber,
        notes: form.notes,
        paymentMethod: paymentMethod,
      };

      const res = await createOrder(orderData);
      setCreatedOrder(res.data);
      
      if (paymentMethod === 'cod') {
        clearCart();
        toast.success('Order placed successfully! Pay on delivery.');
        navigate(`/orders/${res.data.id}`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to place order');
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentData) => {
    toast.success('Payment successful! Order confirmed.');
    clearCart();
    navigate(`/orders/${createdOrder?.id}`);
  };

  if (cartItems.length === 0) {
    return (
      <div className="page flex items-center justify-center min-h-screen">
        <div className="text-center">
          <span className="text-6xl">🛒</span>
          <p className="text-xl font-bold mt-4 text-[var(--ink)]">Your cart is empty</p>
          <button onClick={() => navigate('/menu')} className="btn btn-primary mt-4">Browse Menu</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-[var(--ink)] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
          Checkout
        </h1>
        <p className="text-gray-400 mb-8">Review your order and confirm delivery details</p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Left: Delivery details */}
          <div className="lg:col-span-3 space-y-6">

            {/* Saved Addresses */}
            <div className="card p-6">
              <h2 className="font-bold text-[var(--ink)] mb-4 flex items-center gap-2">
                <span>📍</span> Saved Addresses
              </h2>
              {loadingAddresses ? (
                <div className="text-center py-4 text-gray-400">Loading addresses...</div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">No saved addresses</p>
                  <Link to="/profile" className="text-rose-500 text-sm mt-2 inline-block">Add address in Profile →</Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {addresses.map(addr => (
                    <div
                      key={addr.id}
                      onClick={() => handleAddressSelect(addr)}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedAddressId === addr.id
                          ? 'border-rose-400 bg-rose-50'
                          : 'border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <input
                          type="radio"
                          name="selectedAddress"
                          checked={selectedAddressId === addr.id}
                          onChange={() => handleAddressSelect(addr)}
                          className="mt-1 w-4 h-4 text-rose-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">{addr.label}</span>
                            {addr.isDefault && (
                              <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">Default</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{addr.address}</p>
                          {addr.landmark && (
                            <p className="text-xs text-gray-400 mt-1">Landmark: {addr.landmark}</p>
                          )}
                          {addr.phone && (
                            <p className="text-xs text-gray-400 mt-1">📞 {addr.phone}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <Link to="/profile" className="text-sm text-rose-500 inline-block mt-2">
                    + Add New Address
                  </Link>
                </div>
              )}
            </div>

            {/* Manual Address Input (optional) */}
            <div className="card p-6">
              <h2 className="font-bold text-[var(--ink)] mb-4 flex items-center gap-2">
                <span>✏️</span> Or Enter Manually
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Delivery Address</label>
                  <textarea
                    name="deliveryAddress"
                    value={form.deliveryAddress}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[var(--coral)] transition resize-none"
                    placeholder="Enter your full delivery address..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[var(--coral)] transition"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Order Notes (optional)</label>
                  <input
                    type="text"
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[var(--coral)] transition"
                    placeholder="e.g. Please ring the doorbell"
                  />
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="card p-6">
              <h2 className="font-bold text-[var(--ink)] mb-4 flex items-center gap-2">
                <span>🧾</span> Order Summary ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})
              </h2>
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-start gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-medium text-[var(--ink)] text-sm">{item.quantity}× {item.name}</span>
                        <span className="font-bold text-[var(--coral)] text-sm">₹{(parseFloat(item.price) * item.quantity).toFixed(0)}</span>
                      </div>
                      {item.specialInstructions && (
                        <p className="text-xs text-gray-400 mt-1 italic">📝 {item.specialInstructions}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Price summary */}
          <div className="lg:col-span-2">
            <div className="card p-6 sticky top-24">
              <h2 className="font-bold text-[var(--ink)] mb-5 flex items-center gap-2">
                <span>💰</span> Price Details
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Item Total</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Taxes</span>
                  <span className="text-gray-400">Included</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-[var(--ink)] text-lg">
                  <span>Total</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                <p className="text-sm font-semibold text-gray-700 mb-2">Payment Method</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-white transition">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="w-4 h-4 text-rose-500"
                    />
                    <span className="text-sm text-gray-700">💵 Cash on Delivery</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-white transition">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                      className="w-4 h-4 text-rose-500"
                    />
                    <span className="text-sm text-gray-700">💳 Card / UPI (Razorpay)</span>
                  </label>
                </div>
              </div>

              {/* Estimated delivery time */}
              <div className="mt-4 p-3 bg-orange-50 rounded-xl flex items-center gap-3">
                <span className="text-2xl">⏱️</span>
                <div>
                  <p className="text-sm font-semibold text-orange-700">Est. Delivery Time</p>
                  <p className="text-xs text-orange-500">30 – 45 minutes</p>
                </div>
              </div>

              {!createdOrder ? (
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="btn btn-primary w-full mt-5 py-3 text-base disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Placing Order...
                    </span>
                  ) : (
                    paymentMethod === 'cod' ? `Place Order (Pay ₹${totalPrice.toFixed(2)} on Delivery)` : 'Proceed to Payment'
                  )}
                </button>
              ) : (
                paymentMethod === 'razorpay' && (
                  <PaymentButton
                    amount={totalPrice}
                    orderId={createdOrder.id}
                    onSuccess={handlePaymentSuccess}
                  />
                )
              )}

              <p className="text-xs text-gray-400 text-center mt-3">
                By placing the order you agree to our terms of service
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;