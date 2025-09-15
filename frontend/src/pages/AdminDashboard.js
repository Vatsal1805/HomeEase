import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    statistics: {},
    recentActivity: {}
  });

  useEffect(() => {
    // Redirect if not admin
    if (user && user.userType !== 'admin') {
      toast.error('Access denied. Admin privileges required.', { duration: 2000 });
      navigate('/');
      return;
    }

    if (user && user.userType === 'admin') {
      fetchDashboardData();
    }
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard');
      setDashboardData(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data', { duration: 2000 });
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const { statistics, recentActivity } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.firstName}! Manage your platform from here.</p>
          
          {/* Quick Navigation */}
          <div className="mt-6 flex flex-wrap gap-4">
            <button
              onClick={() => navigate('/admin/users')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <i className="fas fa-users mr-2"></i>
              Manage Users
            </button>
            <button
              onClick={() => navigate('/admin/services')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <i className="fas fa-cog mr-2"></i>
              Manage Services
            </button>
            <button
              onClick={() => navigate('/admin/reviews')}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
            >
              <i className="fas fa-star mr-2"></i>
              Manage Reviews
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <i className="fas fa-users text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.totalUsers || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <i className="fas fa-user-tie text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Providers</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.totalProviders || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <i className="fas fa-clock text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.pendingProviders || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <i className="fas fa-cog text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Services</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.totalServices || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue and Transactions Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
              <i className="fas fa-rupee-sign text-2xl text-green-600"></i>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">₹{(statistics.totalRevenue || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-xl font-semibold text-gray-900">{statistics.totalBookings || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Transaction</p>
                <p className="text-lg font-medium text-gray-700">
                  ₹{statistics.totalBookings > 0 ? Math.round((statistics.totalRevenue || 0) / statistics.totalBookings).toLocaleString() : 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Booking Status</h3>
              <i className="fas fa-chart-pie text-2xl text-blue-600"></i>
            </div>
            <div className="space-y-3">
              {statistics.bookingsByStatus?.map((status) => (
                <div key={status._id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{status._id}</span>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      status._id === 'completed' ? 'bg-green-500' :
                      status._id === 'confirmed' ? 'bg-blue-500' :
                      status._id === 'pending' ? 'bg-yellow-500' :
                      status._id === 'cancelled' ? 'bg-red-500' : 'bg-gray-500'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-900">{status.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Top Services (Completed)</h3>
              <i className="fas fa-star text-2xl text-orange-600"></i>
            </div>
            <div className="space-y-3">
              {statistics.topServices?.slice(0, 5).map((service, index) => (
                <div key={service._id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-xs font-bold text-gray-500 w-6">#{index + 1}</span>
                    <span className="text-sm text-gray-700 truncate">{service.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{service.bookings}</p>
                    <p className="text-xs text-gray-500">₹{service.revenue?.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue (This Year)</h3>
          <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-2">
            {Array.from({ length: 12 }, (_, i) => {
              const month = i + 1;
              const monthData = statistics.monthlyRevenue?.find(m => m._id === month);
              const revenue = monthData?.revenue || 0;
              const maxRevenue = Math.max(...(statistics.monthlyRevenue?.map(m => m.revenue) || [1]));
              const height = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
              
              return (
                <div key={month} className="text-center">
                  <div className="bg-gray-100 h-24 flex items-end justify-center mb-2 rounded">
                    <div 
                      className="bg-blue-500 w-full rounded-t transition-all duration-300"
                      style={{ height: `${height}%` }}
                      title={`₹${revenue.toLocaleString()}`}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600">
                    {new Date(2024, month - 1).toLocaleDateString('en-US', { month: 'short' })}
                  </p>
                  <p className="text-xs font-medium text-gray-900">₹{revenue.toLocaleString()}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Providers Performance */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Provider Performance (Completed Bookings)</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Completed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Services</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue (Completed)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {statistics.providerStats?.slice(0, 10).map((provider) => (
                  <tr key={provider._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{provider.name}</div>
                        <div className="text-sm text-gray-500">{provider.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {provider.completedBookings || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {provider.uniqueServices || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        (provider.averageRating || 0) >= 4 ? 'bg-green-100 text-green-800' :
                        (provider.averageRating || 0) >= 3 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {provider.averageRating ? provider.averageRating.toFixed(1) : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{provider.totalRevenue?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/admin/pending-providers')}
                  className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="text-center">
                    <i className="fas fa-user-check text-2xl text-blue-600 mb-2"></i>
                    <p className="text-sm font-medium text-gray-900">Pending Providers</p>
                    <p className="text-xs text-gray-500">{statistics.pendingProviders || 0} waiting</p>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/admin/users')}
                  className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                >
                  <div className="text-center">
                    <i className="fas fa-users-cog text-2xl text-green-600 mb-2"></i>
                    <p className="text-sm font-medium text-gray-900">Manage Users</p>
                    <p className="text-xs text-gray-500">{statistics.totalUsers || 0} users</p>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/admin/services')}
                  className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
                >
                  <div className="text-center">
                    <i className="fas fa-cogs text-2xl text-purple-600 mb-2"></i>
                    <p className="text-sm font-medium text-gray-900">Manage Services</p>
                    <p className="text-xs text-gray-500">{statistics.totalServices || 0} services</p>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/admin/analytics')}
                  className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
                >
                  <div className="text-center">
                    <i className="fas fa-chart-bar text-2xl text-orange-600 mb-2"></i>
                    <p className="text-sm font-medium text-gray-900">Analytics</p>
                    <p className="text-xs text-gray-500">View reports</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Server Status</span>
                <span className="flex items-center text-green-600">
                  <i className="fas fa-circle text-xs mr-2"></i>
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <span className="flex items-center text-green-600">
                  <i className="fas fa-circle text-xs mr-2"></i>
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Approved Providers</span>
                <span className="text-sm font-medium text-gray-900">{statistics.approvedProviders || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Bookings</span>
                <span className="text-sm font-medium text-gray-900">{statistics.totalBookings || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
            <div className="space-y-3">
              {recentActivity.recentUsers?.length > 0 ? (
                recentActivity.recentUsers.map((user) => (
                  <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent users</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Providers</h3>
            <div className="space-y-3">
              {recentActivity.recentProviders?.length > 0 ? (
                recentActivity.recentProviders.map((provider) => (
                  <div key={provider._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{provider.firstName} {provider.lastName}</p>
                      <p className="text-sm text-gray-600">{provider.email}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        provider.approvalStatus === 'approved' ? 'bg-green-100 text-green-800' :
                        provider.approvalStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {provider.approvalStatus}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(provider.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent providers</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Completed Bookings</h3>
            <div className="space-y-3">
              {recentActivity.recentBookings?.length > 0 ? (
                recentActivity.recentBookings.slice(0, 5).map((booking) => (
                  <div key={booking._id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{booking.customer?.firstName} {booking.customer?.lastName}</p>
                        <p className="text-sm text-gray-600">{booking.services?.[0]?.service?.name || 'Service'}</p>
                        <p className="text-sm text-gray-600">Provider: {booking.provider?.firstName} {booking.provider?.lastName}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status}
                        </span>
                        <p className="text-sm font-medium text-gray-900 mt-1">₹{booking.totalAmount}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent completed bookings</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
