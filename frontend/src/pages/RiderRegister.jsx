import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerRider } from '../services/riderService';  // FIXED: changed from '../../services' to '../services'
import toast from 'react-hot-toast';

const RiderRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', vehicleType: 'motorcycle', vehicleNumber: '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      await registerRider(form);
      toast.success('Registration submitted! Await admin approval.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-100 rounded-2xl mb-4">
            <span className="text-3xl">🛵</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Become a Delivery Rider</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Register below. An admin will review and approve your application.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text" name="name" value={form.name} onChange={handleChange} required
                placeholder="Your full name"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email" name="email" value={form.email} onChange={handleChange} required
                placeholder="rider@example.com"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel" name="phone" value={form.phone} onChange={handleChange} required
                placeholder="+1 555 000 0000"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent"
              />
            </div>

            {/* Password row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password" name="password" value={form.password} onChange={handleChange} required
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm</label>
                <input
                  type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent"
                />
              </div>
            </div>

            {/* Vehicle */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                <select
                  name="vehicleType" value={form.vehicleType} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
                >
                  <option value="bicycle">🚲 Bicycle</option>
                  <option value="motorcycle">🛵 Motorcycle</option>
                  <option value="car">🚗 Car</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle No. <span className="text-gray-400">(optional)</span></label>
                <input
                  type="text" name="vehicleNumber" value={form.vehicleNumber} onChange={handleChange}
                  placeholder="e.g. ABC-1234"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-rose-500 hover:text-rose-600 font-medium">Sign in</Link>
          </p>
        </div>

        {/* Info note */}
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 flex gap-2">
          <span>ℹ️</span>
          <span>Applications are typically reviewed within 24 hours. You'll be notified once approved.</span>
        </div>
      </div>
    </div>
  );
};

export default RiderRegister;