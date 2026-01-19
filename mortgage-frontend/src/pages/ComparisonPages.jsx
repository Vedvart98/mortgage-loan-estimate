import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiUpload, FiEdit } from 'react-icons/fi';
import PDFUploader from '../components/pdf/PDFUploader';
import QuickCompareForm from '../components/comparison/QuickCompareForm';
import { calculateMonthlyPayment } from '../utils/formatters';
import toast from 'react-hot-toast';

export default function ComparisonPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState('choice'); // 'choice', 'manual', 'upload'
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const [initialValues, setInitialValues] = useState(null);
  // useEffect(()=>{
  //   fetchDashboardData();
  // },[]);
useEffect(() => {
   const prefill = location.state?.prefill;
   if (prefill?.userLoan) {
     // map server/frontend userLoan shape to form fields as needed
     setInitialValues({
       loanAmount: prefill.userLoan.loanAmount,
       interestRate: prefill.userLoan.interestRate,
       loanTerm: prefill.userLoan.loanTerm,
       loanType: prefill.userLoan.loanType || 'conventional',
       propertyValue: prefill.userLoan.propertyValue || '',
       closingCosts: prefill.userLoan.closingCosts || '',
       creditScore: prefill.userLoan.creditScore || 720
     });
     setStep('manual'); // open manual form
     // clear location.state if you don't want it reused
     window.history.replaceState({}, document.title, window.location.pathname);
   }
 }, [location]);
  // Handle manual comparison - FIXED VERSION
  const handleManualCompare = async (formData) => {
    setLoading(true);
    try {
      // Calculate monthly payment for user's loan
      const userMonthly = calculateMonthlyPayment(
        parseFloat(formData.loanAmount),
        parseFloat(formData.interestRate),
        parseInt(formData.loanTerm)
      );

      // Simulate our best rate (0.5% better than user's rate)
      const ourBestRate = 6.25;
      
      // Calculate our monthly payment with better rate
      const ourMonthly = calculateMonthlyPayment(
        parseFloat(formData.loanAmount),
        ourBestRate,
        parseInt(formData.loanTerm)
      );

      // Calculate savings
      const monthlySavings = userMonthly - ourMonthly;
      const yearlySavings = monthlySavings * 12;
      const lifetimeSavings = monthlySavings * parseInt(formData.loanTerm) * 12;

      // Prepare comparison data
      const comparisonData = {
        userLoan: {
          loanAmount: parseFloat(formData.loanAmount),
          propertyValue: parseFloat(formData.propertyValue),
          interestRate: parseFloat(formData.interestRate),
          loanTerm: parseInt(formData.loanTerm),
          loanType: formData.loanType,
          monthlyPayment: userMonthly,
          closingCosts: parseFloat(formData.closingCosts) || 5099,
          creditScore: parseInt(formData.creditScore)
        },
        ourRates: {
          interestRate: ourBestRate,
          monthlyPayment: ourMonthly,
          closingCosts: (parseFloat(formData.closingCosts) || 5099) * 0.6 // 40% lower
        },
        savings: {
          monthly: monthlySavings,
          yearly: yearlySavings,
          lifetime: lifetimeSavings
        }
      };

      // Navigate to results page with comparison data
      navigate('/comparison/results', {
        state: comparisonData
      });
      
      toast.success('Comparison complete!');
    } catch (error) {
      toast.error('Failed to compare rates');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle PDF extraction
  const handlePDFExtracted = async (extractedData) => {
    try {
      // Convert extracted data to comparison format
      const formData = {
        loanAmount: extractedData.loanDetails.loanAmount,
        propertyValue: extractedData.loanDetails.propertyValue || extractedData.loanDetails.loanAmount * 1.2,
        interestRate: extractedData.loanDetails.interestRate,
        loanTerm: extractedData.loanDetails.loanTerm,
        loanType: extractedData.loanDetails.loanType,
        closingCosts: extractedData.closingCosts.total,
        creditScore: 720 // Default, can be updated
      };

      await handleManualCompare(formData);
    } catch (error) {
      toast.error('Failed to process PDF');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Choice Screen */}
      {step === 'choice' && (
        <div className="space-y-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Compare Your Mortgage Rate
            </h1>
            <p className="text-xl text-gray-600">
              See how much you could save with our rates
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Manual Entry Option */}
            <button
              onClick={() => setStep('manual')}
              className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all border-2 border-transparent hover:border-green-500 text-left group"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 group-hover:bg-green-500 transition-colors">
                <FiEdit className="w-8 h-8 text-green-600 group-hover:text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Enter Details Manually
              </h3>
              <p className="text-gray-600 mb-4">
                Quick and easy - just fill in your loan information
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Takes 2 minutes
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  No documents needed
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Instant comparison
                </li>
              </ul>
            </button>

            {/* PDF Upload Option */}
            <button
              onClick={() => setStep('upload')}
              className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-500 text-left group"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 group-hover:bg-blue-500 transition-colors">
                <FiUpload className="w-8 h-8 text-blue-600 group-hover:text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Upload Loan Estimate PDF
              </h3>
              <p className="text-gray-600 mb-4">
                Let AI extract your loan details automatically
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center">
                  <span className="text-blue-500 mr-2">✓</span>
                  AI-powered extraction
                </li>
                <li className="flex items-center">
                  <span className="text-blue-500 mr-2">✓</span>
                  95%+ accuracy
                </li>
                <li className="flex items-center">
                  <span className="text-blue-500 mr-2">✓</span>
                  Most accurate results
                </li>
              </ul>
            </button>
          </div>
        </div>
      )}

      {/* Manual Entry Form */}
      {step === 'manual' && (
        <div>
          <button
            onClick={() => setStep('choice')}
            className="mb-6 text-gray-600 hover:text-gray-800 flex items-center"
          >
            ← Back to options
          </button>
          {/* <QuickCompareForm
            onCompare={handleManualCompare}
            onUploadPDF={() => setStep('upload')}
          /> */}
          <QuickCompareForm
        onCompare={handleManualCompare}
        onUploadPDF={() => setStep('upload')}
        initialValues={initialValues}
      />
        </div>
      )}

      {/* PDF Upload */}
      {step === 'upload' && (
        <div>
          <button
            onClick={() => setStep('choice')}
            className="mb-6 text-gray-600 hover:text-gray-800 flex items-center"
          >
            ← Back to options
          </button>
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Upload Your Loan Estimate</h2>
            <PDFUploader onExtracted={handlePDFExtracted} />
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-700">Comparing rates...</p>
          </div>
        </div>
      )}
    </div>
  );
}
