import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Short labels and no emoji to avoid overflow and visual clutter
  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/products', label: 'Products' },
    { path: '/suppliers', label: 'Suppliers' },
    { path: '/warehouses', label: 'Warehouses' },
    { path: '/inventory', label: 'Inventory' },
    { path: '/purchase-orders', label: 'POs' },
    { path: '/sales-orders', label: 'Sales' },
    { path: '/shipments', label: 'Shipments' },
    { path: '/returns', label: 'Returns' },
    { path: '/analytics', label: 'Analytics' },
    ...(user?.role.name === 'admin' ? [{ path: '/users', label: 'Users' }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-full mx-auto">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mr-2">
                  SCM
                </span>
                <span className="hidden md:inline text-sm font-semibold text-gray-700 whitespace-nowrap">
                  Supply Chain Management
                </span>
              </Link>
            </div>

            {/* Desktop Navigation - wrapped to avoid horizontal scrolling */}
            <div className="hidden lg:flex lg:items-center lg:flex-1 lg:justify-center lg:mx-4">
              <div className="flex items-center flex-wrap gap-2 justify-center">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all truncate max-w-[160px] ${
                      location.pathname === item.path
                        ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    title={item.label}
                  >
                    <span className="whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Desktop User Info & Logout */}
            <div className="hidden lg:flex lg:items-center lg:space-x-3 lg:flex-shrink-0">
              <div className="text-right hidden xl:block">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 capitalize truncate max-w-[120px]">
                  {user?.role.name.replace('_', ' ')}
                </p>
              </div>
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors whitespace-nowrap"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden 2xl:inline">Logout</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile short navigation removed to avoid horizontal scroll; use hamburger menu */}
        </div>

        {/* Mobile dropdown menu (alternative) */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium w-full ${
                    location.pathname === item.path
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-gray-200 pt-4 pb-3">
                <div className="px-3 mb-3">
                  <p className="text-base font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">
                    {user?.role.name.replace('_', ' ')}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
