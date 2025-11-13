import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { formatCurrency } from '../utils/format';
import StatCard from '../components/StatCard';
// EmptyState not used

const Dashboard = () => {
  const { data, isLoading } = useQuery('dashboard-stats', async () => {
    const response = await apiClient.get('/analytics/dashboard');
    return response.data.data;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Products',
      value: data?.totalProducts || 0,
      subtitle: 'Active products in catalog',
      color: 'blue' as const,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      title: 'Sales Orders',
      value: data?.totalSalesOrders || 0,
      subtitle: 'Total orders placed',
      color: 'green' as const,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: 'Pending Orders',
      value: data?.pendingOrders || 0,
      subtitle: 'Requires attention',
      color: 'yellow' as const,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Monthly Sales',
      value: formatCurrency(data?.monthlySales || 0),
      subtitle: 'Revenue this month',
      color: 'purple' as const,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Inventory Value',
      value: formatCurrency(data?.totalInventoryValue || 0),
      subtitle: 'Total stock value',
      color: 'blue' as const,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      title: 'Purchase Orders',
      value: data?.totalPurchaseOrders || 0,
      subtitle: 'Orders from suppliers',
      color: 'green' as const,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
  ];

  const quickActions = [
    {
      title: 'Create Sales Order',
      description: 'Start a new customer order',
      link: '/sales-orders',
      icon: '📦',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      title: 'Add Product',
      description: 'Add a new product to catalog',
      link: '/products',
      icon: '➕',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: 'View Inventory',
      description: 'Check stock levels',
      link: '/inventory',
      icon: '📊',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      title: 'Create Purchase Order',
      description: 'Order from suppliers',
      link: '/purchase-orders',
      icon: '🛒',
      color: 'bg-yellow-500 hover:bg-yellow-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome to Walmart SCM</h1>
        <p className="text-blue-100 text-lg">
          Manage your supply chain operations efficiently. Get started with quick actions below.
        </p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, idx) => (
            <Link
              key={idx}
              to={action.link}
              className={`${action.color} text-white rounded-lg p-6 shadow-md hover:shadow-lg transition-all transform hover:scale-105`}
            >
              <div className="text-4xl mb-3">{action.icon}</div>
              <h3 className="font-semibold text-lg mb-1">{action.title}</h3>
              <p className="text-sm text-white/90">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview Statistics</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>
      </div>

      {/* Helpful Tips */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Getting Started</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Start by adding products to your catalog</li>
                <li>Set up suppliers and warehouses</li>
                <li>Create purchase orders to stock inventory</li>
                <li>Create sales orders to fulfill customer requests</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
