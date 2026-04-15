import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/orderService';
import { getAddresses } from '../services/userService';
import PaymentButton from '../components/PaymentButton';
import API from '../services/api';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses]               = useState([]);
  const [loadingAddresses, setLoadingAddresses]  = useState(true);
  const [selectedAddressId, setSelectedAddressId]= useState(null);
  const [form, setForm] = useState({ deliveryAddress: '', phoneNumber: user?.phone || '', notes: '' });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading]             = useState(false);
  const [createdOrder, setCreatedOrder]   = useState(null);

  // Promo state
  const [promoInput, setPromoInput]     = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [availablePromos, setAvailablePromos] = useState([]);
  const discountedTotal = appliedPromo ? appliedPromo.finalAmount : totalPrice;

  // Fetch available promos for display
  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const res = await API.get('/promo/active');
        setAvailablePromos(res.data?.data || []);
      } catch (e) {
        // Silent fail - promos will just not show
      }
    };
    fetchPromos();
  }, []);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await getAddresses();
        const list = res.data?.addresses || res.addresses || [];
        setAddresses(list);
        const def = list.find(a => a.isDefault);
        if (def) {
          setSelectedAddressId(def.id);
          setForm(p => ({ ...p, deliveryAddress: def.address, phoneNumber: def.phone || user?.phone || '' }));
        }
      } catch (e) { console.error(e); } finally { setLoadingAddresses(false); }
    };
    fetchAddresses();
  }, [user]);

  const handleAddressSelect = (a) => {
    setSelectedAddressId(a.id);
    setForm(p => ({ ...p, deliveryAddress: a.address, phoneNumber: a.phone || user?.phone || '' }));
  };
  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) { toast.error('Enter a promo code'); return; }
    setPromoLoading(true);
    try {
      const res = await API.post('/promo/validate', { code: promoInput.trim(), orderAmount: totalPrice });
      setAppliedPromo(res.data.data);
      toast.success(`🎉 ${res.data.message} — ₹${res.data.data.discountAmount.toFixed(2)} off!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid promo code');
    } finally { setPromoLoading(false); }
  };
  
  const handleRemovePromo = () => { setAppliedPromo(null); setPromoInput(''); };
  
  // Quick apply promo from suggestion
  const handleQuickApply = (code) => {
    setPromoInput(code);
    // Auto-apply after a tiny delay
    setTimeout(() => {
      API.post('/promo/validate', { code, orderAmount: totalPrice })
        .then(res => {
          setAppliedPromo(res.data.data);
          toast.success(`🎉 ${res.data.message} — ₹${res.data.data.discountAmount.toFixed(2)} off!`);
        })
        .catch(err => toast.error(err.response?.data?.message || 'Invalid promo code'));
    }, 100);
  };

  const handlePlaceOrder = async () => {
    if (!form.deliveryAddress.trim()) { toast.error('Please enter a delivery address'); return; }
    if (!form.phoneNumber.trim())     { toast.error('Please enter a phone number');     return; }
    if (!cartItems.length)            { toast.error('Your cart is empty');              return; }
    setLoading(true);
    try {
      const res = await createOrder({
        items: cartItems.map(i => ({ menuItemId: i.id, quantity: i.quantity, specialInstructions: i.specialInstructions || '' })),
        deliveryAddress: form.deliveryAddress, phoneNumber: form.phoneNumber,
        notes: form.notes, paymentMethod, promoCode: appliedPromo?.code || null,
      });
      setCreatedOrder(res.data);
      if (paymentMethod === 'cod') { clearCart(); toast.success('Order placed! Pay on delivery.'); navigate(`/orders/${res.data.id}`); }
    } catch (err) { toast.error(err.message || 'Failed to place order'); setLoading(false); }
  };

  const handlePaymentSuccess = () => { toast.success('Payment successful!'); clearCart(); navigate(`/orders/${createdOrder?.id}`); };

  if (!cartItems.length) return (
    <div className="page flex items-center justify-center min-h-screen">
      <div className="text-center">
        <span className="text-6xl">🛒</span>
        <p className="text-xl font-bold mt-4 text-[var(--ink)]">Your cart is empty</p>
        <button onClick={() => navigate('/menu')} className="btn btn-primary mt-4">Browse Menu</button>
      </div>
    </div>
  );

  return (
    <div className="page min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-[var(--ink)] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Checkout</h1>
        <p className="text-gray-400 mb-8">Review your order and confirm delivery details</p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Left */}
          <div className="lg:col-span-3 space-y-6">

            {/* Saved Addresses */}
            <div className="card p-6">
              <h2 className="font-bold text-[var(--ink)] mb-4 flex items-center gap-2"><span>📍</span> Saved Addresses</h2>
              {loadingAddresses ? <div className="text-center py-4 text-gray-400">Loading...</div>
               : addresses.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">No saved addresses</p>
                  <Link to="/profile" className="text-[var(--coral)] text-sm mt-2 inline-block">Add address in Profile →</Link>
                </div>
               ) : (
                <div className="space-y-2">
                  {addresses.map(a => (
                    <div key={a.id} onClick={() => handleAddressSelect(a)}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedAddressId === a.id ? 'border-[var(--coral)] bg-[var(--coral-bg)]' : 'border-gray-100 hover:border-gray-300'}`}>
                      <div className="flex items-start gap-2">
                        <input type="radio" name="addr" checked={selectedAddressId === a.id} onChange={() => handleAddressSelect(a)} className="mt-1 w-4 h-4" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">{a.label}</span>
                            {a.isDefault && <span className="text-xs bg-[var(--coral-bg)] text-[var(--coral)] px-2 py-0.5 rounded-full">Default</span>}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{a.address}</p>
                          {a.landmark && <p className="text-xs text-gray-400 mt-1">Landmark: {a.landmark}</p>}
                          {a.phone    && <p className="text-xs text-gray-400 mt-1">📞 {a.phone}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                  <Link to="/profile" className="text-sm text-[var(--coral)] inline-block mt-2">+ Add New Address</Link>
                </div>
              )}
            </div>

            {/* Manual address */}
            <div className="card p-6">
              <h2 className="font-bold text-[var(--ink)] mb-4 flex items-center gap-2"><span>✏️</span> Or Enter Manually</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Delivery Address</label>
                  <textarea name="deliveryAddress" value={form.deliveryAddress} onChange={handleChange} rows={3}
                    placeholder="Enter your full delivery address..."
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[var(--coral)] transition resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number *</label>
                  <input type="tel" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="+91 XXXXX XXXXX"
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[var(--coral)] transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Order Notes (optional)</label>
                  <input type="text" name="notes" value={form.notes} onChange={handleChange} placeholder="e.g. Please ring the doorbell"
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[var(--coral)] transition" />
                </div>
              </div>
            </div>

            {/* Order items */}
            <div className="card p-6">
              <h2 className="font-bold text-[var(--ink)] mb-4 flex items-center gap-2">
                <span>🧾</span> Order Summary ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})
              </h2>
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-start gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                    {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />}
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-medium text-[var(--ink)] text-sm">{item.quantity}× {item.name}</span>
                        <span className="font-bold text-[var(--coral)] text-sm">₹{(parseFloat(item.price) * item.quantity).toFixed(0)}</span>
                      </div>
                      {item.description        && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{item.description}</p>}
                      {item.specialInstructions && <p className="text-xs text-gray-400 mt-1 italic">📝 {item.specialInstructions}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="lg:col-span-2">
            <div className="card p-6 sticky top-24">
              <h2 className="font-bold text-[var(--ink)] mb-5 flex items-center gap-2"><span>💰</span> Price Details</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Item Total</span><span>₹{totalPrice.toFixed(2)}</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>🎉 Promo ({appliedPromo.code})</span>
                    <span>− ₹{appliedPromo.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span><span className="text-green-600 font-medium">FREE</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Taxes</span><span className="text-gray-400">Included</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-[var(--ink)] text-lg">
                  <span>Total</span><span>₹{discountedTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* ── Promo Code Section ── */}
              <div className="mt-4">
                {/* Available Promos Banner */}
                {!appliedPromo && availablePromos.length > 0 && (
                  <div className="mb-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <p className="text-xs font-semibold text-amber-800 mb-2 flex items-center gap-1">
                      <span>🎉</span> Available Promos - Click to apply:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {availablePromos.slice(0, 3).map(promo => (
                        <button
                          key={promo.code}
                          onClick={() => handleQuickApply(promo.code)}
                          className="text-xs bg-white hover:bg-amber-100 px-3 py-1.5 rounded-full shadow-sm border border-amber-200 transition font-medium text-amber-700"
                        >
                          {promo.code} ({promo.discountType === 'percentage' ? `${promo.discountValue}% off` : `₹${promo.discountValue} off`})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {appliedPromo ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 text-lg">✅</span>
                      <div>
                        <p className="text-sm font-bold text-green-700">{appliedPromo.code}</p>
                        <p className="text-xs text-green-600">₹{appliedPromo.discountAmount.toFixed(2)} discount applied</p>
                      </div>
                    </div>
                    <button onClick={handleRemovePromo} className="text-xs text-gray-400 hover:text-red-500 transition font-medium">Remove</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={promoInput}
                      onChange={e => setPromoInput(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                      placeholder="e.g., WELCOME20, FLAT50"
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[var(--coral)] transition uppercase tracking-widest" 
                    />
                    <button 
                      onClick={handleApplyPromo} 
                      disabled={promoLoading || !promoInput.trim()}
                      className="px-4 py-2 bg-[var(--ink)] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-40 whitespace-nowrap">
                      {promoLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                )}
              </div>

              {/* Payment method */}
              <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                <p className="text-sm font-semibold text-gray-700 mb-2">Payment Method</p>
                <div className="space-y-2">
                  {[['cod','💵 Cash on Delivery'],['razorpay','💳 Card / UPI (Razorpay)']].map(([val, label]) => (
                    <label key={val} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-white transition">
                      <input type="radio" name="paymentMethod" value={val}
                        checked={paymentMethod === val} onChange={() => setPaymentMethod(val)} className="w-4 h-4" />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-4 p-3 bg-orange-50 rounded-xl flex items-center gap-3">
                <span className="text-2xl">⏱️</span>
                <div>
                  <p className="text-sm font-semibold text-orange-700">Est. Delivery Time</p>
                  <p className="text-xs text-orange-500">30 – 45 minutes</p>
                </div>
              </div>

              {!createdOrder ? (
                <button onClick={handlePlaceOrder} disabled={loading}
                  className="btn btn-primary w-full mt-5 py-3 text-base disabled:opacity-60">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Placing Order...
                    </span>
                  ) : (
                    paymentMethod === 'cod'
                      ? `Place Order (Pay ₹${discountedTotal.toFixed(2)} on Delivery)`
                      : `Proceed to Payment — ₹${discountedTotal.toFixed(2)}`
                  )}
                </button>
              ) : (
                paymentMethod === 'razorpay' && (
                  <PaymentButton amount={discountedTotal} orderId={createdOrder.id} onSuccess={handlePaymentSuccess} />
                )
              )}
              <p className="text-xs text-gray-400 text-center mt-3">By placing the order you agree to our terms of service</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;