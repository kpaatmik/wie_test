import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CalendarMonth,
  AccessTime,
  AttachMoney,
  Star,
  RateReview,
  Person,
  CheckCircle,
  Schedule,
  Cancel,
  Done,
  Circle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';

function CaregiverDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [dashboardData, setDashboardData] = useState({
    profile: null,
    stats: {
      total_earnings: 0,
      monthly_earnings: 0,
      total_reviews: 0,
      rating: 0,
      total_appointments: 0,
      monthly_appointments: 0,
    },
    appointments: [],
    reviews: [],
  });

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle color="success" />;
      case 'pending':
        return <Schedule color="warning" />;
      case 'cancelled':
        return <Cancel color="error" />;
      case 'completed':
        return <Done color="info" />;
      default:
        return <Circle />;
    }
  };

  const handleConfirmAppointment = async (appointmentId) => {
    try {
      setError('');
      const response = await api.post(`/booking/appointments/${appointmentId}/confirm/`);
      
      // Update the appointment in the local state
      setDashboardData(prev => ({
        ...prev,
        appointments: prev.appointments.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, ...response.data.appointment }
            : apt
        )
      }));
      
      setSuccessMessage(response.data.message);
    } catch (err) {
      console.error('Error confirming appointment:', err);
      setError(err.response?.data?.error || 'Failed to confirm appointment');
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      setError('');
      const response = await api.post(`/booking/appointments/${appointmentId}/cancel/`);
      
      // Update the appointment in the local state
      setDashboardData(prev => ({
        ...prev,
        appointments: prev.appointments.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: 'cancelled' }
            : apt
        )
      }));
      
      setSuccessMessage('Appointment cancelled successfully');
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setError(err.response?.data?.error || 'Failed to cancel appointment');
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setError('Please log in to access the dashboard');
        setLoading(false);
        return;
      }

      if (user.user_type !== 'caregiver') {
        setError('Only caregivers can access this dashboard');
        setLoading(false);
        return;
      }

      try {
        setError('');
        const responses = await Promise.allSettled([
          api.get('/account/caregivers/me/'),
          api.get('/account/caregivers/stats/'),
          api.get('/booking/appointments/upcoming/'),
          api.get('/account/caregivers/reviews/')
        ]);

        const [profileResponse, statsResponse, appointmentsResponse, reviewsResponse] = responses;

        // Initialize data with defaults
        const newDashboardData = {
          profile: null,
          stats: {
            total_earnings: 0,
            monthly_earnings: 0,
            total_reviews: 0,
            rating: 0,
            total_appointments: 0,
            monthly_appointments: 0,
          },
          appointments: [],
          reviews: [],
        };

        // Handle each response individually
        if (profileResponse.status === 'fulfilled') {
          newDashboardData.profile = profileResponse.value.data;
        } else {
          console.error('Error fetching profile:', profileResponse.reason);
          if (profileResponse.reason?.response?.status === 404) {
            setError('Caregiver profile not found. Please complete your profile setup.');
            setLoading(false);
            return;
          }
        }

        if (statsResponse.status === 'fulfilled') {
          newDashboardData.stats = statsResponse.value.data;
        }

        if (appointmentsResponse.status === 'fulfilled') {
          newDashboardData.appointments = appointmentsResponse.value.data;
        }

        if (reviewsResponse.status === 'fulfilled') {
          newDashboardData.reviews = reviewsResponse.value.data;
        }

        setDashboardData(newDashboardData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.error || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (!user || user.user_type !== 'caregiver') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          Only caregivers can access this dashboard. Please log in with a caregiver account.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert 
          severity="error"
          action={
            error.includes('profile not found') && (
              <Button color="inherit" size="small" onClick={() => navigate('/profile/setup')}>
                Complete Profile
              </Button>
            )
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}
      <Grid container spacing={3}>
        {/* Stats Overview */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                <Typography color="text.secondary" gutterBottom variant="h6" component="div">
                  Monthly Earnings
                </Typography>
                <Typography component="div" variant="h4" sx={{ flexGrow: 1 }}>
                  ${dashboardData.stats.monthly_earnings.toFixed(2)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AttachMoney color="success" />
                  <Typography variant="body2" color="text.secondary">
                    This Month
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                <Typography color="text.secondary" gutterBottom variant="h6" component="div">
                  Total Earnings
                </Typography>
                <Typography component="div" variant="h4" sx={{ flexGrow: 1 }}>
                  ${dashboardData.stats.total_earnings.toFixed(2)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AttachMoney color="primary" />
                  <Typography variant="body2" color="text.secondary">
                    All Time
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                <Typography color="text.secondary" gutterBottom variant="h6" component="div">
                  Rating
                </Typography>
                <Typography component="div" variant="h4" sx={{ flexGrow: 1 }}>
                  {dashboardData.stats.rating?.toFixed(1) || 'N/A'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Star color="warning" />
                  <Typography variant="body2" color="text.secondary">
                    {dashboardData.stats.total_reviews} Reviews
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                <Typography color="text.secondary" gutterBottom variant="h6" component="div">
                  Appointments
                </Typography>
                <Typography component="div" variant="h4" sx={{ flexGrow: 1 }}>
                  {dashboardData.stats.monthly_appointments}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarMonth color="info" />
                  <Typography variant="body2" color="text.secondary">
                    This Month ({dashboardData.stats.total_appointments} Total)
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Appointments */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Appointments
            </Typography>
            <Grid container spacing={2}>
              {dashboardData.appointments.length === 0 ? (
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography color="text.secondary">
                      No upcoming appointments
                    </Typography>
                  </Box>
                </Grid>
              ) : (
                dashboardData.appointments.map((appointment, index) => (
                  <Grid item xs={12} md={6} lg={4} key={index}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        borderLeft: 3,
                        borderColor: `${getStatusColor(appointment.status)}.main`
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          {getStatusIcon(appointment.status)}
                          <Typography 
                            variant="subtitle2" 
                            color={`${getStatusColor(appointment.status)}.main`}
                            sx={{ ml: 1 }}
                          >
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </Typography>
                        </Box>

                        <Typography variant="h6" gutterBottom>
                          {appointment.title || 'Appointment'}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Person sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {appointment.patient_name}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CalendarMonth sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {new Date(appointment.date).toLocaleDateString()}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {appointment.time}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            ({appointment.duration} mins)
                          </Typography>
                        </Box>

                        {appointment.description && (
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ mt: 1 }}
                          >
                            {appointment.description}
                          </Typography>
                        )}
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          onClick={() => navigate(`/appointments/${appointment.id}`)}
                        >
                          View Details
                        </Button>
                        {appointment.status === 'pending' && (
                          <>
                            <Button 
                              size="small" 
                              color="success"
                              onClick={() => handleConfirmAppointment(appointment.id)}
                            >
                              Confirm
                            </Button>
                            <Button 
                              size="small" 
                              color="error"
                              onClick={() => handleCancelAppointment(appointment.id)}
                            >
                              Decline
                            </Button>
                          </>
                        )}
                      </CardActions>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* Recent Reviews */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Reviews
            </Typography>
            <Grid container spacing={2}>
              {dashboardData.reviews.length === 0 ? (
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography color="text.secondary">
                      No reviews yet
                    </Typography>
                  </Box>
                </Grid>
              ) : (
                dashboardData.reviews.map((review, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Star sx={{ color: 'warning.main', mr: 1 }} />
                          <Typography variant="h6">
                            {review.rating}/5
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {review.comment}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          {new Date(review.created_at).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default CaregiverDashboard;
