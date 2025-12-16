import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiFileText, FiTrendingUp, FiDollarSign, FiPlus } from 'react-icons/fi';
import { loanService } from '../services/loanService';
import { formatCurrency, formatPercent } from '../utils/formatters';
import LoanCard from '../components/loans/LoanCard';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentLoans, setRecentLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, loansRes] = await Promise.all([
        loanService.getStats(),
        loanService.getMyLoans({ limit: 3 })
      ]);
      setStats(statsRes.data);
      setRecentLoans(loansRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this loan?')) {
      try {
        await loanService.deleteLoan(id);
        toast.success('Loan deleted successfully');
        fetchDashboardData();
      } catch (error) {
        toast.error('Failed to delete loan');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your mortgage overview.</p>
        </div>
        <Link to="/loans" className="btn btn-primary">
          <FiPlus className="mr-2" />
          Add New Loan
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && stats.totalLoans > 0 ? (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Loans</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalLoans}</p>
              </div>
              <FiFileText className="w-12 h-12 text-blue-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Best APR</p>
                <p className="text-3xl font-bold text-green-600">
                  {formatPercent(stats.lowestAPR)}
                </p>
              </div>
              <FiTrendingUp className="w-12 h-12 text-green-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Loan Amount</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(stats.totalLoanAmount)}
                </p>
              </div>
              <FiDollarSign className="w-12 h-12 text-blue-600" />
            </div>
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <FiFileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No loans yet</h3>
          <p className="text-gray-600 mb-6">Start by uploading your first loan estimate</p>
          <Link to="/loans" className="btn btn-primary">
            Upload Loan Estimate
          </Link>
        </div>
      )}

      {/* Recent Loans */}
      {recentLoans.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Recent Loans</h2>
            <Link to="/loans" className="text-blue-600 hover:text-blue-700">
              View All →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {recentLoans.map((loan) => (
              <LoanCard key={loan._id} loan={loan} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <Link to="/loans/new" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <FiPlus className="w-6 h-6 text-blue-600 mb-2" />
            <p className="font-medium">Upload New Loan</p>
            <p className="text-sm text-gray-500">Extract data from PDF</p>
          </Link>
          <Link to="/comparison" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <FiTrendingUp className="w-6 h-6 text-blue-600 mb-2" />
            <p className="font-medium">Compare Rates</p>
            <p className="text-sm text-gray-500">See market comparison</p>
          </Link>
          <Link to="/calculators" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <FiDollarSign className="w-6 h-6 text-blue-600 mb-2" />
            <p className="font-medium">Calculate Scenarios</p>
            <p className="text-sm text-gray-500">Run what-if analysis</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
