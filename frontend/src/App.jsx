import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import theme from './theme';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';

// Layout
import Layout from './components/Layout/Layout';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Main Pages
import Home from './pages/Home/Home';
import PregnantDashboard from './pages/Pregnant/PregnantDashboard';
import CaregiverSearch from './pages/Caregiver/CaregiverSearch';
import CaregiverProfile from './pages/Caregiver/CaregiverProfile';
import CaregiverDashboard from './pages/Caregiver/CaregiverDashboard';
import ExpertSessions from './pages/Sessions/ExpertSessions';
import SessionDetails from './pages/Sessions/SessionDetails';
import Appointments from './pages/Appointments/Appointments';
import Social from './pages/Social/Social';
import Profile from './pages/Profile/Profile';
import ChatbotPanel from './components/ChatbotPanel';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Home />} />
              <Route path="pregnant/dashboard" element={<PregnantDashboard />} />
              <Route path="caregiver/dashboard" element={<CaregiverDashboard />} />
              <Route path="caregivers" element={<CaregiverSearch />} />
              <Route path="caregivers/:id" element={<CaregiverProfile />} />
              <Route path="sessions" element={<ExpertSessions />} />
              <Route path="sessions/:id" element={<SessionDetails />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="social" element={<Social />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} />
          <ChatbotPanel />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
