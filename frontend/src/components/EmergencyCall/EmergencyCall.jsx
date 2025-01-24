import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Chip,
  ButtonGroup
} from '@mui/material';
import {
  Phone,
  Circle,
  Schedule
} from '@mui/icons-material';

const EmergencyCall = () => {
  const navigate = useNavigate();

  const handleEmergencyCall = () => {
    window.open('https://meet.google.com/rck-jgix-qii', '_blank');
  };

  const handleScheduleSession = () => {
    navigate('/sessions');
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Medical Assistance
          </Typography>
          <Chip
            icon={<Circle sx={{ fontSize: 12 }} />}
            label="Doctors Available"
            color="success"
            size="small"
            sx={{ mr: 1 }}
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Connect with our medical experts through immediate calls or schedule a session at your convenience.
        </Typography>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={7}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <Phone />
              </Avatar>
              <Box>
                <Typography variant="subtitle1">
                  24/7 Expert Support
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Immediate or scheduled video consultations
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={5} sx={{ textAlign: { sm: 'right' } }}>
            <ButtonGroup variant="contained" orientation="vertical" fullWidth>
              <Button
                color="error"
                startIcon={<Phone />}
                onClick={handleEmergencyCall}
                sx={{ mb: 1 }}
              >
                Call Now
              </Button>
              <Button
                color="primary"
                startIcon={<Schedule />}
                onClick={handleScheduleSession}
              >
                Schedule Session
              </Button>
            </ButtonGroup>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default EmergencyCall;
