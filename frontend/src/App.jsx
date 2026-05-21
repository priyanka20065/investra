import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MarketProvider } from './context/MarketContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Markets from './pages/Markets';
import Portfolio from './pages/Portfolio';
import Orders from './pages/Orders';
import Watchlist from './pages/Watchlist';
import StockDetails from './pages/StockDetails';
import ChatbotWidget from './components/ChatbotWidget';
import Profile from './pages/Profile';
import AIAssistant from './pages/AIAssistant';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { ToastProvider } from './context/ToastContext';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <MarketProvider>
            <Router>
              <Routes>
                {/* Protected Dashboard Routes */}
                <Route path="/*" element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/markets" element={<Markets />} />
                        <Route path="/portfolio" element={<Portfolio />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/watchlist" element={<Watchlist />} />
                        <Route path="/stock/:ticker" element={<StockDetails />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/mentor" element={<AIAssistant />} />
                      </Routes>
                      {/* Global Chatbot Widget placed outside main layout container but inside contexts */}
                      <ChatbotWidget />
                    </Layout>
                  </ProtectedRoute>
                } />

                {/* Public Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
              </Routes>
            </Router>
          </MarketProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
