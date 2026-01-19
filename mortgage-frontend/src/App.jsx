import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import LoansPage from './pages/LoansPage';
import NewLoanPage from './pages/NewLoanPage';
import ComparisonPage from './pages/ComparisonPages';
import CalculatorsPage from './pages/CalculatorsPage';
import NotFoundPage from './pages/NotFoundPage';
import ComparisonResultPage from './pages/ComparisonResultPage';
import ApplicationSuccess from './pages/ApplicationSuccess';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/loans" element={<LoansPage />} />
            <Route path="/loans/new" element={<NewLoanPage/>}/>
            <Route path="/comparison" element={<ComparisonPage />} />
            <Route path="/calculators" element={<CalculatorsPage />} />
            <Route path="/comparison/results" element={<ComparisonResultPage/>}/>
            <Route path="/application-success" element={<ApplicationSuccess/>} />
            
          </Route>

          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
