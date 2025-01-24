import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Card, CardContent, List, ListItem, ListItemText, Divider, Button, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../api/axios';

const CaregiverDashboard = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    profile: null,
    upcomingAppointments: [],
    reviews: [],
    earnings: {
      thisMonth: 0,
      total: 0
    }
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!user?.id || user.user_type !== 'caregiver') {
          throw new Error('Invalid user type');
        }

        // Get the caregiver profile using the /me endpoint
        const caregiverResponse = await axios.get('/account/caregivers/me/');
        const caregiverProfile = caregiverResponse.data;
        
        // Fetch upcoming appointments (assuming endpoint exists)
        const appointmentsResponse = await axios.get('/booking/appointments/upcoming/');
        
        setDashboardData({
          profile: caregiverProfile,
          upcomingAppointments: appointmentsResponse.data || [],
          reviews: caregiverProfile.reviews || [],
          earnings: {
            thisMonth: calculateMonthlyEarnings(appointmentsResponse.data),
            total: calculateTotalEarnings(appointmentsResponse.data)
          }
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const calculateMonthlyEarnings = (appointments) => {
    const currentMonth = new Date().getMonth();
    return appointments?.reduce((total, apt) => {
      const aptMonth = new Date(apt.date).getMonth();
      return aptMonth === currentMonth ? total + apt.amount : total;
    }, 0) || 0;
  };

  const calculateTotalEarnings = (appointments) => {
    return appointments?.reduce((total, apt) => total + apt.amount, 0) || 0;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!dashboardData.profile) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          Error: Could not load caregiver profile. Please make sure you are logged in as a caregiver.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.first_name}!
      </Typography>

      <Grid container spacing={3}>
        {/* Stats Overview */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Overview
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Rating" 
                  secondary={dashboardData.profile?.rating || 'No ratings yet'} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="This Month's Earnings" 
                  secondary={`$${dashboardData.earnings.thisMonth}`} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Total Earnings" 
                  secondary={`$${dashboardData.earnings.total}`} 
                />
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
              <List>
                {dashboardData.upcomingAppointments.map((appointment, index) => (
                  <React.Fragment key={appointment.id}>
                    <ListItem>
                      <ListItemText
                        primary={`${appointment.pregnant_woman.user.first_name} ${appointment.pregnant_woman.user.last_name}`}
                        secondary={`${new Date(appointment.date).toLocaleDateString()} at ${appointment.time}`}
                      />
                      <Button variant="outlined" color="primary">
                        View Details
                      </Button>
                    </ListItem>
                    {index < dashboardData.upcomingAppointments.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography color="textSecondary">
                No upcoming appointments
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Recent Reviews */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Reviews
            </Typography>
            {dashboardData.reviews.length > 0 ? (
              <Grid container spacing={2}>
                {dashboardData.reviews.slice(0, 3).map((review) => (
                  <Grid item xs={12} md={4} key={review.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {new Date(review.created_at).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body1">
                          {review.comment}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                          Rating: {review.rating}/5
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography color="textSecondary">
                No reviews yet
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CaregiverDashboard;
