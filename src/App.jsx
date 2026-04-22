import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/layout/Navbar';
import PrivateRoute from './components/PrivateRoute';

import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/dashboard/*" 
              element={
                <PrivateRoute adminOnly={true}>
                  <DashboardPage />
                </PrivateRoute>
              } 
            />
          </Routes>
        </main>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App;
