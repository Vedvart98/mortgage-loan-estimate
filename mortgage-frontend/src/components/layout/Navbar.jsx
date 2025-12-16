import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FiHome, FiFileText, FiBarChart2,FiLogOut} from 'react-icons/fi';
import {FaCalculator} from 'react-icons/fa'
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/loans', icon: FiFileText, label: 'My Loans' },
    { path: '/comparison', icon: FiBarChart2, label: 'Compare' },
    { path: '/calculators', icon: FaCalculator, label: 'Calculators' }
  ];

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">MortgageHub</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navLinks.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive(path)
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <Icon className="mr-2" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-gray-700 mr-4">
              {user?.firstName} {user?.lastName}
            </span>
            <button
              onClick={logout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray bg-red-600 hover:bg-red-700"
            >
              <FiLogOut className="" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
