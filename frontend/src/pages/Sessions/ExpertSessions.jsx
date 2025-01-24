import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Container,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Schedule } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';

const ExpertSessions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [description, setDescription] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simulate successful scheduling
    setSnackbar({
      open: true,
      message: 'Session scheduled successfully!',
      severity: 'success'
    });

    // Reset form fields
    setDescription('');
    setSelectedDate(new Date());

    // Redirect to home after 2 seconds
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Schedule Expert Session
        </Typography>

        <Card>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <DateTimePicker
                    label="Session Date & Time"
                    value={selectedDate}
                    onChange={(newValue) => setSelectedDate(newValue)}
                    slots={{
                      textField: (params) => <TextField {...params} fullWidth />
                    }}
                    minDate={new Date()}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Session Description"
                    multiline
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add any notes or special instructions for the session..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<Schedule />}
                    fullWidth
                    size="large"
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
          autoHideDuration={2000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
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

export default ExpertSessions;
