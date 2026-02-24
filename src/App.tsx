import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';

import Home from './pages/Home';
import Profile from './pages/Profile';
import AddBook from './pages/AddBook';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Routes */}
          <Route element={
            <div className="min-h-screen bg-gray-50 flex flex-col">
              <Navigation />
              <div className="flex-1">
                <ProtectedRoute />
              </div>
            </div>
          }>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/add-book" element={<AddBook />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
