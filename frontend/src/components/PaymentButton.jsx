import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const PaymentButton = ({ amount, orderId, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);

    // Load Razorpay script
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      toast.error('Failed to load payment gateway');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/payments/create-order`,
        { amount, receipt: `order_${orderId}` },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { orderId: razorpayOrderId, amount: orderAmount, currency } = response.data;

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: orderAmount,
        currency: currency,
        name: "Sara's Kitchen",
        description: `Payment for Order #${orderId}`,
        order_id: razorpayOrderId,
        handler: async (paymentResponse) => {
          try {
            const verifyResponse = await axios.post(
              `${process.env.REACT_APP_API_URL}/payments/verify-payment`,
              {
                orderId: razorpayOrderId,
                paymentId: paymentResponse.razorpay_payment_id,
                signature: paymentResponse.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (verifyResponse.data.success) {
              toast.success('Payment successful!');
              if (onSuccess) onSuccess(verifyResponse.data);
            }
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: JSON.parse(localStorage.getItem('user'))?.name || '',
          email: JSON.parse(localStorage.getItem('user'))?.email || '',
        },
        theme: {
          color: '#E8412A',
        },
        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="btn btn-primary btn-full"
    >
      {loading ? 'Processing...' : `Pay ₹${amount}`}
    </button>
  );
};

export default PaymentButton;