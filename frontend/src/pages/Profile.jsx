import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getProfile, updateProfile, changePassword, addAddress, updateAddress, deleteAddress } from '../services/userService';

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  
  // Profile edit modal
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [updatingProfile, setUpdatingProfile] = useState(false);
  
  // Password change modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Address modal
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    address: '',
    landmark: '',
    phone: '',
    isDefault: false
  });
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getProfile();
      setUser(res.data.user);
      setAddresses(res.data.addresses || []);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const res = await updateProfile(profileForm);
      setUser(res.data.user);
      toast.success('Profile updated successfully');
      setShowProfileModal(false);
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setChangingPassword(true);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success('Password changed successfully');
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.address) {
      toast.error('Address is required');
      return;
    }
    setSavingAddress(true);
    try {
      if (editingAddress) {
        await updateAddress(editingAddress.id, addressForm);
        toast.success('Address updated successfully');
      } else {
        await addAddress(addressForm);
        toast.success('Address added successfully');
      }
      fetchProfile();
      setShowAddressModal(false);
      resetAddressForm();
    } catch (error) {
      toast.error(error.message || 'Failed to save address');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await deleteAddress(id);
      toast.success('Address deleted successfully');
      fetchProfile();
    } catch (error) {
      toast.error('Failed to delete address');
    }
  };

  const handleSetDefaultAddress = async (address) => {
    if (address.isDefault) return;
    try {
      await updateAddress(address.id, { ...address, isDefault: true });
      toast.success('Default address updated');
      fetchProfile();
    } catch (error) {
      toast.error('Failed to update default address');
    }
  };

  const openEditAddressModal = (address) => {
    setEditingAddress(address);
    setAddressForm({
      label: address.label,
      address: address.address,
      landmark: address.landmark || '',
      phone: address.phone || '',
      isDefault: address.isDefault
    });
    setShowAddressModal(true);
  };

  const resetAddressForm = () => {
    setEditingAddress(null);
    setAddressForm({
      label: 'Home',
      address: '',
      landmark: '',
      phone: '',
      isDefault: false
    });
  };

  const openProfileModal = () => {
    setProfileForm({ name: user?.name || '', phone: user?.phone || '' });
    setShowProfileModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-3">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your account and saved addresses</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Left Column - Profile Info */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-3xl">
                  {user?.name?.charAt(0) || '?'}
                </div>
                <h2 className="text-lg font-bold text-gray-900 mt-3">{user?.name}</h2>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <p className="text-xs text-gray-400 mt-1 capitalize">Role: {user?.role}</p>
              </div>
              
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Phone</span>
                  <span className="text-gray-900">{user?.phone || 'Not set'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Member since</span>
                  <span className="text-gray-900">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <button
                  onClick={openProfileModal}
                  className="w-full py-2 text-sm font-medium text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50 transition"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Addresses */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Saved Addresses</h3>
                <button
                  onClick={() => {
                    resetAddressForm();
                    setShowAddressModal(true);
                  }}
                  className="px-3 py-1.5 text-sm font-medium text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50 transition"
                >
                  + Add Address
                </button>
              </div>
              
              {addresses.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📍</div>
                  <p className="text-gray-500">No saved addresses</p>
                  <p className="text-sm text-gray-400">Add your delivery addresses for faster checkout</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-4 rounded-lg border transition ${
                        addr.isDefault ? 'border-rose-300 bg-rose-50' : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">{addr.label}</span>
                            {addr.isDefault && (
                              <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">Default</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{addr.address}</p>
                          {addr.landmark && (
                            <p className="text-xs text-gray-400 mt-1">Landmark: {addr.landmark}</p>
                          )}
                          {addr.phone && (
                            <p className="text-xs text-gray-400 mt-1">📞 {addr.phone}</p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          {!addr.isDefault && (
                            <button
                              onClick={() => handleSetDefaultAddress(addr)}
                              className="text-xs text-gray-500 hover:text-rose-500"
                            >
                              Set Default
                            </button>
                          )}
                          <button
                            onClick={() => openEditAddressModal(addr)}
                            className="text-xs text-gray-500 hover:text-blue-500"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="text-xs text-gray-500 hover:text-red-500"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Edit Profile</h2>
              <button onClick={() => setShowProfileModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowProfileModal(false)} className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={updatingProfile} className="flex-1 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50">
                  {updatingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
              <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={changingPassword} className="flex-1 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50">
                  {changingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editingAddress ? 'Edit Address' : 'Add New Address'}</h2>
              <button onClick={() => { setShowAddressModal(false); resetAddressForm(); }} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSaveAddress} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                <select
                  value={addressForm.label}
                  onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
                >
                  <option value="Home">🏠 Home</option>
                  <option value="Work">💼 Work</option>
                  <option value="Other">📍 Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <textarea
                  value={addressForm.address}
                  onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
                  placeholder="Street, area, city, pincode"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Landmark (Optional)</label>
                <input
                  type="text"
                  value={addressForm.landmark}
                  onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
                  placeholder="Near metro station, opposite mall"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                <input
                  type="tel"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
                  placeholder="Alternative phone for this address"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="w-4 h-4 text-rose-500 rounded focus:ring-rose-400"
                />
                <label htmlFor="isDefault" className="text-sm text-gray-700">Set as default delivery address</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowAddressModal(false); resetAddressForm(); }} className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={savingAddress} className="flex-1 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50">
                  {savingAddress ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;