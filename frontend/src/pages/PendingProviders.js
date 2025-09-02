import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const PendingProviders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pendingProviders, setPendingProviders] = useState([]);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    // Redirect if not admin
    if (user && user.userType !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }

    if (user && user.userType === 'admin') {
      fetchPendingProviders();
    }
  }, [user, navigate]);

  const fetchPendingProviders = async () => {
    try {
      const response = await axios.get('/api/admin/pending-providers');
      setPendingProviders(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pending providers:', error);
      toast.error('Failed to fetch pending providers');
      setLoading(false);
    }
  };

  const handleApproval = async (providerId, status, reason = '') => {
    if (processingId) return; // Prevent multiple simultaneous requests
    
    setProcessingId(providerId);
    
    try {
      await axios.put(`/api/admin/approve-provider/${providerId}`, {
        status,
        reason
      });

      toast.success(`Provider ${status} successfully!`);
      
      // Remove from pending list
      setPendingProviders(prev => prev.filter(provider => provider._id !== providerId));
      
    } catch (error) {
      console.error(`Error ${status} provider:`, error);
      toast.error(`Failed to ${status} provider`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleApprove = (providerId) => {
    handleApproval(providerId, 'approved');
  };

  const handleReject = (providerId) => {
    const reason = window.prompt('Please provide a reason for rejection (optional):');
    if (reason !== null) { // User didn't cancel
      handleApproval(providerId, 'rejected', reason);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pending providers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pending Provider Approvals</h1>
              <p className="mt-2 text-gray-600">Review and approve service provider registrations</p>
            </div>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Pending Providers List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Pending Requests ({pendingProviders.length})
            </h2>
          </div>

          {pendingProviders.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <i className="fas fa-user-check text-6xl"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Requests</h3>
              <p className="text-gray-600">All provider registrations have been processed.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {pendingProviders.map((provider) => (
                <div key={provider._id} className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <i className="fas fa-user text-gray-600 text-xl"></i>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {provider.firstName} {provider.lastName}
                          </h3>
                          <p className="text-gray-600">{provider.email}</p>
                          <p className="text-gray-600">{provider.phone}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Registration Date:</span>
                          <span className="ml-2 text-gray-600">
                            {new Date(provider.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Time:</span>
                          <span className="ml-2 text-gray-600">
                            {new Date(provider.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        {provider.providerDetails?.businessName && (
                          <div>
                            <span className="font-medium text-gray-700">Business Name:</span>
                            <span className="ml-2 text-gray-600">
                              {provider.providerDetails.businessName}
                            </span>
                          </div>
                        )}
                        {provider.providerDetails?.description && (
                          <div className="md:col-span-2">
                            <span className="font-medium text-gray-700">Description:</span>
                            <span className="ml-2 text-gray-600">
                              {provider.providerDetails.description}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 lg:ml-6">
                      <button
                        onClick={() => handleApprove(provider._id)}
                        disabled={processingId === provider._id}
                        className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {processingId === provider._id ? (
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                        ) : (
                          <i className="fas fa-check mr-2"></i>
                        )}
                        Approve
                      </button>
                      
                      <button
                        onClick={() => handleReject(provider._id)}
                        disabled={processingId === provider._id}
                        className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {processingId === provider._id ? (
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                        ) : (
                          <i className="fas fa-times mr-2"></i>
                        )}
                        Reject
                      </button>
                      
                      <button
                        onClick={() => {
                          // View more details in a modal or expanded view
                          alert(`Provider Details:\nName: ${provider.firstName} ${provider.lastName}\nEmail: ${provider.email}\nPhone: ${provider.phone}\nRegistered: ${new Date(provider.createdAt).toLocaleString()}`);
                        }}
                        className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <i className="fas fa-eye mr-2"></i>
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {pendingProviders.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => {
                  if (window.confirm(`Are you sure you want to approve all ${pendingProviders.length} pending providers?`)) {
                    pendingProviders.forEach(provider => handleApprove(provider._id));
                  }
                }}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                disabled={processingId}
              >
                <i className="fas fa-check-double mr-2"></i>
                Approve All
              </button>
              
              <button
                onClick={() => fetchPendingProviders()}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <i className="fas fa-refresh mr-2"></i>
                Refresh
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingProviders;
