import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Container,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { VideoCall, Schedule } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';

const Sessions = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sessionType, setSessionType] = useState('emergency');
  const [description, setDescription] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/booking/sessions/', {
        date: selectedDate.toISOString(),
        session_type: sessionType,
        description: description,
        meet_link: 'https://meet.google.com/rck-jgix-qii'
      });

      setSnackbar({
        open: true,
        message: 'Session scheduled successfully!',
        severity: 'success'
      });

      // Reset form
      setDescription('');
      setSelectedDate(new Date());
      setSessionType('emergency');
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to schedule session. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleEmergencyCall = () => {
    window.open('https://meet.google.com/rck-jgix-qii', '_blank');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Medical Sessions
        </Typography>

        {/* Emergency Call Card */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Need Immediate Assistance?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Connect instantly with our available medical experts for emergency consultation.
            </Typography>
            <Button
              variant="contained"
              color="error"
              startIcon={<VideoCall />}
              onClick={handleEmergencyCall}
              fullWidth
            >
              Start Emergency Call Now
            </Button>
          </CardContent>
        </Card>

        {/* Schedule Session Form */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Schedule a Session
            </Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Session Type"
                    value={sessionType}
                    onChange={(e) => setSessionType(e.target.value)}
                  >
                    <MenuItem value="emergency">Emergency Consultation</MenuItem>
                    <MenuItem value="followup">Follow-up Consultation</MenuItem>
                    <MenuItem value="routine">Routine Checkup</MenuItem>
                  </TextField>
                </Grid>
                
                <Grid item xs={12}>
                  <DateTimePicker
                    label="Session Date & Time"
                    value={selectedDate}
                    onChange={(newValue) => setSelectedDate(newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                    minDate={new Date()}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please describe your concerns or reason for the session..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<Schedule />}
                    fullWidth
                  >
                    Schedule Session
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
};

export default Sessions;
