import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const IDVerification = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    id_type: '',
    id_number: '',
    id_front_image: null,
    id_back_image: null
  });

  useEffect(() => {
    const checkVerificationAndRedirect = async () => {
      try {
        const response = await api.get('/account/verification/status/');
        if (response.data.is_verified) {
          // Get user details to determine the correct dashboard
          const userResponse = await api.get('/account/users/me/');
          const userType = userResponse.data.user_type;
          
          // Redirect based on user type
          if (userType === 'pregnant') {
            navigate('/pregnant/dashboard');
          } else if (userType === 'caregiver') {
            navigate('/caregiver/dashboard');
          } else {
            navigate('/');
          }
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
      }
    };

    if (user) {
      checkVerificationAndRedirect();
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) {
        formDataToSend.append(key, formData[key]);
      }
    });

    try {
      await api.post('/account/verification/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('ID verification submitted successfully. Please wait for admin approval.');
      
      // After successful submission, check user type and redirect accordingly
      const userResponse = await api.get('/account/users/me/');
      const userType = userResponse.data.user_type;
      
      setTimeout(() => {
        if (userType === 'pregnant') {
          navigate('/pregnant/dashboard');
        } else if (userType === 'caregiver') {
          navigate('/caregiver/dashboard');
        } else {
          navigate('/');
        }
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Error submitting verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: 'background.default',
        py: 4
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 500,
          mx: 2
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom align="center">
          ID Verification
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Please provide your identification details for verification
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>ID Type</InputLabel>
            <Select
              name="id_type"
              value={formData.id_type}
              onChange={handleChange}
              required
              label="ID Type"
            >
              <MenuItem value="passport">Passport</MenuItem>
              <MenuItem value="drivers_license">Driver's License</MenuItem>
              <MenuItem value="national_id">National ID</MenuItem>
              <MenuItem value="aadhar">Aadhar Card</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="ID Number"
            name="id_number"
            value={formData.id_number}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Front side of ID
            </Typography>
            <input
              type="file"
              name="id_front_image"
              accept="image/*"
              onChange={handleFileChange}
              required
              style={{ width: '100%' }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Back side of ID
            </Typography>
            <input
              type="file"
              name="id_back_image"
              accept="image/*"
              onChange={handleFileChange}
              required
              style={{ width: '100%' }}
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{ mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Submit Verification'}
          </Button>
        </form>

        <Typography variant="body2" color="text.secondary" align="center">
          Your ID will be securely stored and reviewed by our team
        </Typography>
      </Paper>
    </Box>
  );
};

export default IDVerification;
