import { Link } from 'react-router-dom';
import { FiCheckCircle, FiTrendingUp, FiDollarSign, FiShield } from 'react-icons/fi';

export default function HomePage() {
  const features = [
    {
      icon: FiCheckCircle,
      title: 'AI-Powered PDF Extraction',
      description: 'Upload your loan estimate and let AI extract all the data automatically'
    },
    {
      icon: FiTrendingUp,
      title: 'Real-Time Market Comparison',
      description: 'Compare your rate with current market rates and see where you stand'
    },
    {
      icon: FiDollarSign,
      title: 'Savings Calculator',
      description: 'Calculate potential savings and find the best loan option for you'
    },
    {
      icon: FiShield,
      title: 'Secure & Private',
      description: 'Your financial data is encrypted and stored securely'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">MortgageHub</h1>
          <div className="space-x-4">
            <Link to="/login" className="btn btn-secondary">Login</Link>
            <Link to="/register" className="btn btn-primary">Sign Up</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Find the Best Mortgage Rate
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Compare mortgage rates, calculate savings, and make informed decisions
          </p>
          <Link to="/register" className="btn btn-primary text-lg px-8 py-3">
            Get Started Free
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <feature.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="mt-20">
          <h3 className="text-3xl font-bold text-center mb-12">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h4 className="font-semibold mb-2">Upload Your Loan Estimate</h4>
              <p className="text-gray-600 text-sm">
                Upload your PDF loan estimate and our AI extracts all data automatically
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h4 className="font-semibold mb-2">Compare with Market</h4>
              <p className="text-gray-600 text-sm">
                See how your rate compares to current market rates from top lenders
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h4 className="font-semibold mb-2">Get Recommendations</h4>
              <p className="text-gray-600 text-sm">
                Receive personalized recommendations to save thousands on your mortgage
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
