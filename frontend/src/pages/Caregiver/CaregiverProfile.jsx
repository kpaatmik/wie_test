import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Avatar,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Rating,
  Chip,
  Tabs,
  Tab,
  Divider,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  School,
  Work,
  Star,
  Language,
  VerifiedUser,
  Info,
  AttachMoney,
  EventAvailable,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const CaregiverProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [caregiver, setCaregiver] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  // Booking form state
  const [bookingData, setBookingData] = useState({
    date: null,
    time: null,
  });

  // Rating form state
  const [ratingData, setRatingData] = useState({
    rating: 0,
    comment: '',
  });

  useEffect(() => {
    const fetchCaregiver = async () => {
      try {
        const response = await api.get(`/account/caregivers/${id}/`);
        setCaregiver(response.data);
        console.log('Caregiver data:', response.data);
      } catch (error) {
        console.error('Error fetching caregiver:', error);
        setError('Failed to load caregiver profile');
      } finally {
        setLoading(false);
      }
    };

    fetchCaregiver();
  }, [id]);

  const handleBookingSubmit = async () => {
    try {
      setError(null);
      setSuccess('');

      if (!bookingData.date || !bookingData.time) {
        setError('Please select both date and time for the appointment');
        return;
      }

      const formattedDate = format(bookingData.date, 'yyyy-MM-dd');
      const formattedTime = format(bookingData.time, 'HH:mm:ss');

      await api.post('/booking/appointments/', {
        caregiver: parseInt(id),
        date: formattedDate,
        time: formattedTime,
      });

      setSuccess('Appointment request sent successfully! Waiting for caregiver confirmation.');
      setBookingOpen(false);
      setBookingData({
        date: null,
        time: null,
      });
    } catch (err) {
      console.error('Error booking appointment:', err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.data) {
        // Handle validation errors
        const errors = Object.values(err.response.data).flat();
        setError(errors.join(' '));
      } else {
        setError('Failed to book appointment. Please try again.');
      }
    }
  };

  const handleBookingOpen = () => {
    setError(null);
    setSuccess('');
    setBookingData({
      date: null,
      time: null,
    });
    setBookingOpen(true);
  };

  const handleBookingClose = () => {
    setError(null);
    setSuccess('');
    setBookingData({
      date: null,
      time: null,
    });
    setBookingOpen(false);
  };

  const handleRatingSubmit = async () => {
    try {
      if (!ratingData.rating) {
        setError('Please provide a rating');
        return;
      }

      await api.post(`/account/caregivers/${id}/review/`, {
        rating: parseInt(ratingData.rating),
        comment: ratingData.comment || '',
      });

      setSuccess('Review submitted successfully!');
      setRatingOpen(false);
      setRatingData({
        rating: 0,
        comment: '',
      });

      // Refresh caregiver data to show new rating
      const response = await api.get(`/account/caregivers/${id}/`);
      setCaregiver(response.data);
    } catch (error) {
      console.error('Error submitting review:', error);
      setError(error.response?.data?.error || 'Failed to submit review. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!caregiver) {
    return (
      <Container>
        <Alert severity="error">Failed to load caregiver profile</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <Avatar
              src={caregiver.user.profile_picture}
              sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}
            />
            <Typography variant="h5" gutterBottom>
              {caregiver.user.first_name} {caregiver.user.last_name}
            </Typography>
            <Rating value={caregiver.rating} readOnly precision={0.5} />
            <Typography variant="body2" color="text.secondary">
              ({caregiver.total_reviews} reviews)
            </Typography>
            
            {/* Debug info - temporarily show user info */}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Current user type: {user?.user_type}
            </Typography>
            
            {/* Show buttons for pregnant users or if no user is logged in */}
            {(user?.user_type === 'pregnant' || !user) && (
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleBookingOpen}
                  sx={{ mr: 2 }}
                  startIcon={<EventAvailable />}
                >
                  Book Appointment
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<Star />}
                  onClick={() => {
                    if (!user) {
                      // Redirect to login if not logged in
                      navigate('/login', { state: { from: `/caregiver/${id}` } });
                      return;
                    }
                    setRatingOpen(true);
                  }}
                  fullWidth
                >
                  Write Review
                </Button>
              </Box>
            )}
          </Grid>
          
          <Grid item xs={12} md={8}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <AttachMoney />
                </ListItemIcon>
                <ListItemText 
                  primary="Hourly Rate"
                  secondary={`$${caregiver.hourly_rate}/hour`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Work />
                </ListItemIcon>
                <ListItemText 
                  primary="Experience"
                  secondary={`${caregiver.experience_years} years`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LocationOn />
                </ListItemIcon>
                <ListItemText 
                  primary="Location"
                  secondary={`${caregiver.user.city}, ${caregiver.user.state}`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Language />
                </ListItemIcon>
                <ListItemText 
                  primary="Languages"
                  secondary={caregiver.languages.join(', ')}
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="About" />
          <Tab label="Experience" />
          <Tab label="Reviews" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="body1">{caregiver.bio}</Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Specializations</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {caregiver.specializations.map((spec, index) => (
                <Chip key={index} label={spec} />
              ))}
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {caregiver.experiences.map((exp) => (
            <Box key={exp.id} sx={{ mb: 3 }}>
              <Typography variant="h6">{exp.title}</Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {exp.organization}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {format(parseISO(exp.start_date), 'MMM yyyy')} - 
                {exp.is_current ? ' Present' : format(parseISO(exp.end_date), ' MMM yyyy')}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                {exp.description}
              </Typography>
            </Box>
          ))}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {caregiver.reviews.map((review) => (
            <Paper key={review.id} sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Rating value={review.rating} readOnly size="small" />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  by {review.reviewer_name}
                </Typography>
              </Box>
              <Typography variant="body1">{review.comment}</Typography>
              <Typography variant="caption" color="text.secondary">
                {format(parseISO(review.created_at), 'PPP')}
              </Typography>
            </Paper>
          ))}
        </TabPanel>
      </Paper>

      {/* Booking Dialog */}
      <Dialog 
        open={bookingOpen} 
        onClose={handleBookingClose}
        maxWidth="sm" 
        fullWidth
        aria-labelledby="booking-dialog-title"
      >
        <DialogTitle id="booking-dialog-title">Book Appointment</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <DatePicker
                    label="Date *"
                    value={bookingData.date}
                    onChange={(newValue) => {
                      setError(null);
                      setBookingData({ ...bookingData, date: newValue });
                    }}
                    minDate={new Date()}
                    slots={{
                      textField: (params) => (
                        <TextField
                          {...params}
                          fullWidth
                          error={Boolean(error && !bookingData.date)}
                          helperText={
                            error && !bookingData.date 
                              ? "Date is required" 
                              : "Select appointment date"
                          }
                        />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TimePicker
                    label="Time *"
                    value={bookingData.time}
                    onChange={(newValue) => {
                      setError(null);
                      setBookingData({ ...bookingData, time: newValue });
                    }}
                    slots={{
                      textField: (params) => (
                        <TextField
                          {...params}
                          fullWidth
                          error={Boolean(error && !bookingData.time)}
                          helperText={
                            error && !bookingData.time 
                              ? "Time is required" 
                              : "Select appointment time"
                          }
                        />
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </LocalizationProvider>
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {success}
              </Alert>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              * Required fields
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBookingClose} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleBookingSubmit} 
            variant="contained" 
            color="primary"
            disabled={!bookingData.date || !bookingData.time}
          >
            Request Appointment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={ratingOpen} onClose={() => setRatingOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Write a Review</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography component="legend">Rating</Typography>
              <Rating
                name="rating"
                value={ratingData.rating}
                onChange={(event, newValue) => {
                  setRatingData({ ...ratingData, rating: newValue });
                }}
              />
            </Box>
            <TextField
              label="Comment"
              multiline
              rows={4}
              value={ratingData.comment}
              onChange={(e) => setRatingData({ ...ratingData, comment: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRatingOpen(false)}>Cancel</Button>
          <Button onClick={handleRatingSubmit} variant="contained" color="primary">
            Submit Review
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CaregiverProfile;
