import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getAllRiders, approveRider } from '../../services/riderService';

const vehicleIcon = { bicycle: '🚲', motorcycle: '🛵', car: '🚗' };

const StatusPill = ({ status }) => {
  const styles = {
    pending:  'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${styles[status]}`}>
      {status}
    </span>
  );
};

const ManageRiders = () => {
  const [riders, setRiders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [filter, setFilter]   = useState('all');

  const fetchRiders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllRiders();
      
      // Handle different response structures
      let ridersData = [];
      if (response.data?.riders) {
        ridersData = response.data.riders;
      } else if (response.riders) {
        ridersData = response.riders;
      } else if (Array.isArray(response)) {
        ridersData = response;
      } else if (response.data && Array.isArray(response.data)) {
        ridersData = response.data;
      }
      
      console.log('Riders loaded:', ridersData); // Debug log
      setRiders(ridersData);
      
      if (ridersData.length === 0) {
        console.log('No riders found in database');
      }
    } catch (err) {
      console.error('Fetch riders error:', err);
      setError(err.message || 'Failed to load riders');
      toast.error('Failed to load riders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchRiders(); 
  }, []);

  const handleApproval = async (userId, status) => {
    try {
      await approveRider(userId, status);
      toast.success(`Rider ${status} successfully`);
      fetchRiders(); // Refresh the list
    } catch (err) {
      toast.error(err.message || 'Failed to update rider status');
    }
  };

  const filtered = filter === 'all' 
    ? riders 
    : riders.filter(r => r.approvalStatus === filter);

  const counts = {
    all:      riders.length,
    pending:  riders.filter(r => r.approvalStatus === 'pending').length,
    approved: riders.filter(r => r.approvalStatus === 'approved').length,
    rejected: riders.filter(r => r.approvalStatus === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center py-16">
            <div className="spinner mx-auto" style={{ width: 40, height: 40 }} />
            <p className="text-gray-500 mt-4">Loading riders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manage Riders</h1>
          <p className="text-gray-500 text-sm mt-1">Review applications and manage delivery riders</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700 font-medium">⚠️ {error}</p>
            <button 
              onClick={fetchRiders} 
              className="mt-2 text-sm text-red-600 underline hover:text-red-800"
            >
              Try again
            </button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Riders', value: counts.all, color: 'text-gray-900', icon: '🛵' },
            { label: 'Pending Review', value: counts.pending, color: 'text-amber-600', icon: '⏳' },
            { label: 'Approved', value: counts.approved, color: 'text-green-600', icon: '✅' },
            { label: 'Rejected', value: counts.rejected, color: 'text-red-600', icon: '❌' },
          ].map(card => (
            <div key={card.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-1">
                <span>{card.icon}</span>
                <span className="text-xs text-gray-500">{card.label}</span>
              </div>
              <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex gap-1 p-1 border-b border-gray-100 overflow-x-auto">
            {['all', 'pending', 'approved', 'rejected'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors whitespace-nowrap ${
                  filter === f ? 'bg-rose-50 text-rose-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {f} {counts[f] > 0 && <span className="ml-1 text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">{counts[f]}</span>}
              </button>
            ))}
          </div>

          {/* Riders List */}
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">
                {filter === 'pending' ? '⏳' : filter === 'approved' ? '✅' : filter === 'rejected' ? '❌' : '🛵'}
              </div>
              <p className="text-gray-500 font-medium">
                {filter === 'all' && counts.all === 0 
                  ? 'No riders registered yet' 
                  : filter === 'pending' 
                    ? 'No pending applications'
                    : filter === 'approved' 
                      ? 'No approved riders'
                      : filter === 'rejected' 
                        ? 'No rejected riders' 
                        : 'No riders found'}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {filter === 'all' && counts.all === 0 
                  ? 'Riders can register from the login/signup page' 
                  : 'Try a different filter'}
              </p>
              {filter === 'all' && counts.all === 0 && (
                <Link 
                  to="/rider/register" 
                  className="inline-block mt-4 px-4 py-2 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600"
                >
                  + Register as a Rider
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map(rider => (
                <div key={rider.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Rider Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-lg flex-shrink-0">
                      {vehicleIcon[rider.vehicleType] || '🛵'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{rider.user?.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">{rider.user?.email || 'No email'}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-gray-400">📞 {rider.user?.phone || 'No phone'}</span>
                        <span className="text-xs text-gray-400 capitalize">
                          {vehicleIcon[rider.vehicleType]} {rider.vehicleType || 'N/A'}
                          {rider.vehicleNumber ? ` · ${rider.vehicleNumber}` : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats + Status */}
                  <div className="flex items-center gap-6 md:gap-8">
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-900">{rider.totalDeliveries || 0}</p>
                      <p className="text-xs text-gray-400">Deliveries</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-900">{parseFloat(rider.rating || 5).toFixed(1)}⭐</p>
                      <p className="text-xs text-gray-400">Rating</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${rider.isAvailable ? 'bg-green-400' : 'bg-gray-300'}`} />
                        <p className="text-xs text-gray-500">{rider.isAvailable ? 'Online' : 'Offline'}</p>
                      </div>
                      <StatusPill status={rider.approvalStatus} />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      {rider.approvalStatus === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproval(rider.userId, 'approved')}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleApproval(rider.userId, 'rejected')}
                            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg transition-colors border border-red-200"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {rider.approvalStatus === 'approved' && (
                        <button
                          onClick={() => handleApproval(rider.userId, 'rejected')}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium rounded-lg transition-colors"
                        >
                          Suspend
                        </button>
                      )}
                      {rider.approvalStatus === 'rejected' && (
                        <button
                          onClick={() => handleApproval(rider.userId, 'approved')}
                          className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 text-sm font-medium rounded-lg border border-green-200 transition-colors"
                        >
                          Re-approve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageRiders;