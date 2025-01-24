import { useState, useEffect } from 'react';
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CalendarMonth,
  AccessTime,
  MedicalServices,
  BookOnline,
  Group,
  Article,
  CheckCircle,
  Schedule,
  Cancel,
  Done,
  Circle,
  Person,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import EmergencyCall from '../../components/EmergencyCall/EmergencyCall';

function PregnantDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dashboardData, setDashboardData] = useState({
    pregnancyWeek: 0,
    upcomingAppointments: [],
    recentPosts: [],
    recommendedCaregivers: [],
  });
  const [cancellingAppointment, setCancellingAppointment] = useState(false);

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

  const handleCancelAppointment = async (appointmentId) => {
    try {
      setCancellingAppointment(true);
      await api.post(`/booking/appointments/${appointmentId}/cancel/`);
      
      // Update the appointment status in the local state
      setDashboardData(prev => ({
        ...prev,
        upcomingAppointments: prev.upcomingAppointments.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: 'cancelled' }
            : apt
        )
      }));

      // Show success message
      setSuccess('Appointment cancelled successfully');
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setError(err.response?.data?.detail || 'Failed to cancel appointment');
    } finally {
      setCancellingAppointment(false);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || user.user_type !== 'pregnant') {
        setError('Only pregnant users can access this dashboard');
        setLoading(false);
        return;
      }

      try {
        setError('');
        const responses = await Promise.allSettled([
          api.get('/account/pregnant-women/me/'),
          api.get('/booking/appointments/upcoming/'),
          api.get('/social/posts/recent/'),
          api.get('/account/caregivers/recommended/')
        ]);

        const [pregnancyResponse, appointmentsResponse, postsResponse, caregiversResponse] = responses;

        // Initialize data with defaults
        const newDashboardData = {
          pregnancyWeek: 0,
          upcomingAppointments: [],
          recentPosts: [],
          recommendedCaregivers: [],
        };

        // Handle each response individually
        if (pregnancyResponse.status === 'fulfilled') {
          newDashboardData.pregnancyWeek = pregnancyResponse.value.data.pregnancy_week;
        } else {
          console.error('Error fetching pregnancy data:', pregnancyResponse.reason);
        }

        if (appointmentsResponse.status === 'fulfilled') {
          newDashboardData.upcomingAppointments = appointmentsResponse.value.data;
        }

        if (postsResponse.status === 'fulfilled') {
          newDashboardData.recentPosts = postsResponse.value.data.slice(0, 3);
        }

        if (caregiversResponse.status === 'fulfilled') {
          newDashboardData.recommendedCaregivers = caregiversResponse.value.data.slice(0, 3);
        }

        setDashboardData(newDashboardData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.detail || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (!user || user.user_type !== 'pregnant') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          Only pregnant users can access this dashboard. Please log in with a pregnant user account.
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Emergency Call Section */}
        <Grid item xs={12}>
          <EmergencyCall />
        </Grid>

        {/* Welcome Message */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              Welcome back, {user?.first_name}!
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {dashboardData.pregnancyWeek > 0 
                ? `You are in week ${dashboardData.pregnancyWeek} of your pregnancy`
                : 'Loading pregnancy information...'}
            </Typography>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <List>
              <ListItem button onClick={() => navigate('/caregivers')}>
                <ListItemIcon>
                  <CalendarMonth />
                </ListItemIcon>
                <ListItemText primary="Find Caregiver" />
              </ListItem>
              <ListItem button onClick={() => navigate('/appointments')}>
                <ListItemIcon>
                  <AccessTime />
                </ListItemIcon>
                <ListItemText primary="View Appointments" />
              </ListItem>
              <ListItem button onClick={() => navigate('/community')}>
                <ListItemIcon>
                  <Group />
                </ListItemIcon>
                <ListItemText primary="Join Community" />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Appointments Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Your Appointments
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/caregivers')}
                startIcon={<BookOnline />}
              >
                Book New Appointment
              </Button>
            </Box>

            {dashboardData.upcomingAppointments.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No appointments found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Book an appointment with a caregiver to get started
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {dashboardData.upcomingAppointments.map((appointment, index) => (
                  <Grid item xs={12} md={6} lg={4} key={appointment.id}>
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
                            {appointment.caregiver_name || 'Unknown Caregiver'}
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
                          <Button 
                            size="small" 
                            color="error"
                            onClick={() => handleCancelAppointment(appointment.id)}
                            disabled={cancellingAppointment}
                          >
                            Cancel
                          </Button>
                        )}
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>

        {/* Recent Community Posts */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Community Posts
            </Typography>
            <Grid container spacing={2}>
              {dashboardData.recentPosts.length === 0 ? (
                <Grid item xs={12}>
                  <Typography color="text.secondary">
                    No recent posts. Join the community to see posts from other mothers.
                  </Typography>
                </Grid>
              ) : (
                dashboardData.recentPosts.map((post, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">{post.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {post.content.substring(0, 100)}...
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button size="small" onClick={() => navigate(`/community/post/${post.id}`)}>
                          Read More
                        </Button>
                      </CardActions>
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

export default PregnantDashboard;
