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
  EventNote,
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
      rating: 0,
      total_reviews: 0,
      total_appointments: 0,
      monthly_appointments: 0,
      total_earnings: 0,
      monthly_earnings: 0
    },
    appointments: [],
    reviews: []
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

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [profileRes, statsRes, appointmentsRes, reviewsRes] = await Promise.all([
        api.get('/account/caregivers/me/'),
        api.get('/account/caregivers/stats/'),
        api.get('/booking/appointments/upcoming/'),
        api.get('/account/caregivers/reviews/')
      ]);

      setDashboardData({
        profile: profileRes.data,
        stats: {
          rating: statsRes.data.rating || 0,
          total_reviews: statsRes.data.total_reviews || 0,
          total_appointments: statsRes.data.total_appointments || 0,
          monthly_appointments: statsRes.data.monthly_appointments || 0,
          total_earnings: statsRes.data.total_earnings || 0,
          monthly_earnings: statsRes.data.monthly_earnings || 0
        },
        appointments: appointmentsRes.data || [],
        reviews: reviewsRes.data || []
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Star sx={{ color: 'warning.main', mr: 1 }} />
                    <Typography variant="h6">
                      {(dashboardData.stats?.rating || 0).toFixed(1)}/5
                    </Typography>
                  </Box>
                  <Typography color="text.secondary" variant="body2">
                    Rating ({dashboardData.stats?.total_reviews || 0} reviews)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarMonth sx={{ color: 'primary.main', mr: 1 }} />
                    <Typography variant="h6">
                      {dashboardData.stats?.monthly_appointments || 0}
                    </Typography>
                  </Box>
                  <Typography color="text.secondary" variant="body2">
                    Appointments This Month
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EventNote sx={{ color: 'primary.main', mr: 1 }} />
                    <Typography variant="h6">
                      {dashboardData.stats?.total_appointments || 0}
                    </Typography>
                  </Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Appointments
                  </Typography>
                </CardContent>
              </Card>
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
                  <Grid item xs={12} md={4} key={review.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Star sx={{ color: 'warning.main', mr: 1 }} />
                          <Typography variant="h6">
                            {Number(review.rating || 0).toFixed(1)}/5
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {review.comment || 'No comment provided'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          By {review.reviewer_name || 'Anonymous'} on {new Date(review.created_at).toLocaleDateString()}
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
