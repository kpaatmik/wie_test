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
} from '@mui/material';
import {
  CalendarMonth,
  AccessTime,
  MedicalServices,
  BookOnline,
  Group,
  Article,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';

function PregnantDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    pregnancyWeek: 0,
    upcomingAppointments: [],
    recentPosts: [],
    recommendedCaregivers: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch pregnancy details
        const pregnancyResponse = await api.get('/account/pregnant-women/me/');
        const appointmentsResponse = await api.get('/appointments/upcoming/');
        const postsResponse = await api.get('/social/posts/recent/');
        const caregiversResponse = await api.get('/account/caregivers/recommended/');

        setDashboardData({
          pregnancyWeek: pregnancyResponse.data.pregnancy_week,
          upcomingAppointments: appointmentsResponse.data.slice(0, 3),
          recentPosts: postsResponse.data.slice(0, 3),
          recommendedCaregivers: caregiversResponse.data.slice(0, 3),
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Welcome Message */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              Welcome back, {user?.first_name}!
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              You are in week {dashboardData.pregnancyWeek} of your pregnancy
            </Typography>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <List>
              <ListItem button onClick={() => navigate('/appointments')}>
                <ListItemIcon>
                  <CalendarMonth />
                </ListItemIcon>
                <ListItemText primary="Book Appointment" />
              </ListItem>
              <ListItem button onClick={() => navigate('/caregivers')}>
                <ListItemIcon>
                  <MedicalServices />
                </ListItemIcon>
                <ListItemText primary="Find Caregiver" />
              </ListItem>
              <ListItem button onClick={() => navigate('/sessions')}>
                <ListItemIcon>
                  <BookOnline />
                </ListItemIcon>
                <ListItemText primary="Expert Sessions" />
              </ListItem>
              <ListItem button onClick={() => navigate('/social')}>
                <ListItemIcon>
                  <Group />
                </ListItemIcon>
                <ListItemText primary="Community" />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Upcoming Appointments */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Appointments
            </Typography>
            {dashboardData.upcomingAppointments.length > 0 ? (
              dashboardData.upcomingAppointments.map((appointment, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1">
                      {appointment.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <CalendarMonth sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {new Date(appointment.date).toLocaleDateString()}
                      </Typography>
                      <AccessTime sx={{ ml: 2, mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {appointment.time}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => navigate(`/appointments/${appointment.id}`)}>
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No upcoming appointments
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Recent Community Posts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Community Posts
            </Typography>
            {dashboardData.recentPosts.length > 0 ? (
              dashboardData.recentPosts.map((post, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1">
                      {post.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {post.content}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => navigate(`/social/posts/${post.id}`)}>
                      Read More
                    </Button>
                  </CardActions>
                </Card>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No recent posts
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Recommended Caregivers */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recommended Caregivers
            </Typography>
            {dashboardData.recommendedCaregivers.length > 0 ? (
              dashboardData.recommendedCaregivers.map((caregiver, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1">
                      {caregiver.user.first_name} {caregiver.user.last_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {caregiver.specializations.join(', ')}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => navigate(`/caregivers/${caregiver.id}`)}>
                      View Profile
                    </Button>
                  </CardActions>
                </Card>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No recommended caregivers
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default PregnantDashboard;
