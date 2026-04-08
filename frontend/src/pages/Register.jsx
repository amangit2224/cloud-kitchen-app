import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const [userType, setUserType] = useState('customer'); // 'customer' or 'rider'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    // Rider specific fields
    vehicleType: 'motorcycle',
    vehicleNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      if (userType === 'customer') {
        await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: 'customer'
        });
        toast.success('Registration successful! Please login.');
        navigate('/login');
      } else {
        // Rider registration - uses separate API
        const { registerRider } = await import('../services/riderService');
        await registerRider({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          vehicleType: formData.vehicleType,
          vehicleNumber: formData.vehicleNumber
        });
        toast.success('Rider application submitted! Awaiting admin approval.');
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page page-sm fade-up">
      <div className="card" style={{ maxWidth: 500, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1>Create Account</h1>
          <p style={{ color: 'var(--ink-50)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {userType === 'customer' ? 'Sign up to start ordering' : 'Join our delivery team'}
          </p>
        </div>

        {/* User Type Toggle */}
        <div className="flex gap-2 mb-6" style={{ display: 'flex', gap: '1rem', background: 'var(--ink-05)', padding: '0.25rem', borderRadius: 'var(--r-md)' }}>
          <button
            type="button"
            onClick={() => setUserType('customer')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              userType === 'customer' 
                ? 'bg-white text-rose-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🍽️ Customer
          </button>
          <button
            type="button"
            onClick={() => setUserType('rider')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              userType === 'rider' 
                ? 'bg-white text-rose-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🛵 Rider
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="label">Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input"
              placeholder="John Doe"
            />
          </div>

          <div className="form-group">
            <label className="label">Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input"
              placeholder="john@example.com"
            />
          </div>

          <div className="form-group">
            <label className="label">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="input"
              placeholder="+91 9876543210"
            />
          </div>

          {userType === 'rider' && (
            <>
              <div className="form-group">
                <label className="label">Vehicle Type *</label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="bicycle">🚲 Bicycle</option>
                  <option value="motorcycle">🛵 Motorcycle</option>
                  <option value="car">🚗 Car</option>
                </select>
              </div>

              <div className="form-group">
                <label className="label">Vehicle Number (Optional)</label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., KA01AB1234"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="label">Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="input"
              placeholder="Minimum 6 characters"
            />
          </div>

          <div className="form-group">
            <label className="label">Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="input"
              placeholder="Confirm your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ padding: '0.75rem', marginTop: '0.5rem' }}
          >
            {loading ? 'Creating Account...' : (userType === 'customer' ? 'Sign Up' : 'Apply as Rider')}
          </button>
        </form>

        <div className="divider" style={{ margin: '1.5rem 0' }}>
          <span style={{ background: 'var(--white)', padding: '0 1rem', color: 'var(--ink-50)' }}>Or</span>
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--ink-80)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--coral)', fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;