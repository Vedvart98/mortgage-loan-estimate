import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiUpload, FiEdit } from 'react-icons/fi';
import { loanService } from '../services/loanService';
import PDFUploader from '../components/pdf/PDFUploader';
import DataConfirmation from '../components/pdf/DataConfirmation';
import LoanCard from '../components/loans/LoanCard';
import toast from 'react-hot-toast';

export default function LoansPage() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const [extractedData, setExtractedData] = useState(null);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await loanService.getMyLoans();
      setLoans(response.data);
    } catch (error) {
      toast.error('Failed to load loans');
    } finally {
      setLoading(false);
    }
  };

  const handleExtracted = (data) => {
    setExtractedData(data);
    setShowUploader(false);
  };

  const handleConfirm = async (data) => {
    try {
      await loanService.saveLoan(data);
      toast.success('Loan saved successfully');
      setExtractedData(null);
      fetchLoans();
    } catch (error) {
      toast.error('Failed to save loan');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this loan?')) {
      try {
        await loanService.deleteLoan(id);
        toast.success('Loan deleted successfully');
        fetchLoans();
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
          <h1 className="text-3xl font-bold text-gray-900">My Loans</h1>
          <p className="text-gray-600">Manage and compare your mortgage loans</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowUploader(true)}
            className="btn btn-secondary"
          >
            <FiUpload className="mr-2" />
            Upload PDF
          </button>
          <Link to="/loans/new" className="btn btn-primary">
            <FiEdit className="mr-2" />
            Enter Manually
          </Link>
        </div>
      </div>

      {/* PDF Uploader Modal */}
      {showUploader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Upload Loan Estimate</h2>
              <button
                onClick={() => setShowUploader(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <PDFUploader onExtracted={handleExtracted} />
          </div>
        </div>
      )}

      {/* Data Confirmation */}
      {extractedData && (
        <DataConfirmation
          data={extractedData}
          onConfirm={handleConfirm}
          onEdit={() => setExtractedData(null)}
        />
      )}

      {/* Loans Grid */}
      {loans.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loans.map((loan) => (
            <LoanCard key={loan._id} loan={loan} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <FiPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No loans yet</h3>
          <p className="text-gray-600 mb-6">Add your first loan estimate</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setShowUploader(true)}
              className="btn btn-secondary"
            >
              <FiUpload className="mr-2" />
              Upload PDF
            </button>
            <Link to="/loans/new" className="btn btn-primary">
              <FiEdit className="mr-2" />
              Enter Manually
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
