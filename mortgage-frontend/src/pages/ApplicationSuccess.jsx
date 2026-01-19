import { Link } from 'react-router-dom';
import { FiCheckCircle, FiMail, FiPhone } from 'react-icons/fi';

export default function ApplicationSuccess() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <FiCheckCircle className="text-green-600 text-5xl" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Application Submitted Successfully!
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Thank you for choosing MortgagePro. We've received your application and will review it shortly.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h2 className="font-semibold text-gray-900 mb-4">What happens next?</h2>
            <ul className="text-left space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>You'll receive a confirmation email within 5 minutes</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>A loan officer will review your application within 24 hours</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>We'll contact you to discuss next steps and required documents</span>
              </li>
            </ul>
          </div>

          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="flex items-center text-gray-600">
              <FiMail className="mr-2" />
              <span>support@mortgagepro.com</span>
            </div>
            <div className="flex items-center text-gray-600">
              <FiPhone className="mr-2" />
              <span>(555) 123-4567</span>
            </div>
          </div>

          <Link to="/dashboard" className="btn btn-primary">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}