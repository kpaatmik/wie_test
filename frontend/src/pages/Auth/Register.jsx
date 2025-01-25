import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Link,
  Paper,
  useTheme,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Grid,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const validationSchema = Yup.object({
  username: Yup.string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
  password2: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('password'), null], 'Passwords must match'),
  first_name: Yup.string().required('First name is required'),
  last_name: Yup.string().required('Last name is required'),
  phone_number: Yup.string().required('Phone number is required'),
  address: Yup.string().required('Address is required'),
  city: Yup.string().required('City is required'),
  state: Yup.string().required('State is required'),
  user_type: Yup.string().required('Please select a user type'),
  // Conditional validation for caregiver fields
  bio: Yup.string().when('user_type', {
    is: 'caregiver',
    then: () => Yup.string().required('Bio is required for caregivers'),
  }),
  hourly_rate: Yup.number().when('user_type', {
    is: 'caregiver',
    then: () => 
      Yup.number()
        .required('Hourly rate is required for caregivers')
        .min(0, 'Hourly rate must be positive'),
  }),
  experience_years: Yup.number().when('user_type', {
    is: 'caregiver',
    then: () => 
      Yup.number()
        .min(0, 'Experience years must be positive')
        .nullable(),
  }),
});

function Register() {
  const theme = useTheme();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      password2: '',
      first_name: '',
      last_name: '',
      phone_number: '',
      address: '',
      city: '',
      state: '',
      user_type: 'pregnant',
      // Caregiver specific fields
      bio: '',
      hourly_rate: '',
      experience_years: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      try {
        const result = await register(values);
        if (result.success) {
          toast.success('Registration successful!');
        } else {
          if (typeof result.error === 'object') {
            const errorMessages = [];
            for (const [field, messages] of Object.entries(result.error)) {
              if (Array.isArray(messages)) {
                errorMessages.push(`${field}: ${messages.join(', ')}`);
              } else if (typeof messages === 'string') {
                errorMessages.push(`${field}: ${messages}`);
              }
            }
            setError(errorMessages.join('\n'));
          } else {
            setError(result.error);
          }
        }
      } catch (error) {
        setError('An unexpected error occurred. Please try again.');
        console.error('Registration error:', error);
      } finally {
        setLoading(false);
      }
    },
  });

  const isCaregiver = formik.values.user_type === 'caregiver';

  return (
    <Box
      sx={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '800px',
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%'
        }}
      >
        <Typography
          component="h1"
          variant="h4"
          color="primary"
          sx={{ mb: 4, fontWeight: 600 }}
        >
          Create Account
        </Typography>
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
            {error.split('\n').map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </Alert>
        )}
        <form onSubmit={formik.handleSubmit} style={{ width: '100%' }}>
          <Grid container spacing={2}>
            {/* User Type Selection */}
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">I am a:</FormLabel>
                <RadioGroup
                  row
                  name="user_type"
                  value={formik.values.user_type}
                  onChange={formik.handleChange}
                >
                  <FormControlLabel
                    value="pregnant"
                    control={<Radio />}
                    label="Pregnant Woman"
                  />
                  <FormControlLabel
                    value="caregiver"
                    control={<Radio />}
                    label="Caregiver"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>

            {/* Basic Information */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="username"
                name="username"
                label="Username"
                value={formik.values.username}
                onChange={formik.handleChange}
                error={formik.touched.username && Boolean(formik.errors.username)}
                helperText={formik.touched.username && formik.errors.username}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>

            {/* Password Fields */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="password"
                name="password"
                label="Password"
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="password2"
                name="password2"
                label="Confirm Password"
                type="password"
                value={formik.values.password2}
                onChange={formik.handleChange}
                error={formik.touched.password2 && Boolean(formik.errors.password2)}
                helperText={formik.touched.password2 && formik.errors.password2}
              />
            </Grid>

            {/* Personal Information */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="first_name"
                name="first_name"
                label="First Name"
                value={formik.values.first_name}
                onChange={formik.handleChange}
                error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                helperText={formik.touched.first_name && formik.errors.first_name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="last_name"
                name="last_name"
                label="Last Name"
                value={formik.values.last_name}
                onChange={formik.handleChange}
                error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                helperText={formik.touched.last_name && formik.errors.last_name}
              />
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="phone_number"
                name="phone_number"
                label="Phone Number"
                value={formik.values.phone_number}
                onChange={formik.handleChange}
                error={formik.touched.phone_number && Boolean(formik.errors.phone_number)}
                helperText={formik.touched.phone_number && formik.errors.phone_number}
              />
            </Grid>

            {/* Address Fields */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="address"
                name="address"
                label="Address"
                value={formik.values.address}
                onChange={formik.handleChange}
                error={formik.touched.address && Boolean(formik.errors.address)}
                helperText={formik.touched.address && formik.errors.address}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="city"
                name="city"
                label="City"
                value={formik.values.city}
                onChange={formik.handleChange}
                error={formik.touched.city && Boolean(formik.errors.city)}
                helperText={formik.touched.city && formik.errors.city}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="state"
                name="state"
                label="State"
                value={formik.values.state}
                onChange={formik.handleChange}
                error={formik.touched.state && Boolean(formik.errors.state)}
                helperText={formik.touched.state && formik.errors.state}
              />
            </Grid>

            {/* Caregiver Specific Fields */}
            {isCaregiver && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="bio"
                    name="bio"
                    label="Bio"
                    multiline
                    rows={4}
                    value={formik.values.bio}
                    onChange={formik.handleChange}
                    error={formik.touched.bio && Boolean(formik.errors.bio)}
                    helperText={formik.touched.bio && formik.errors.bio}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="hourly_rate"
                    name="hourly_rate"
                    label="Hourly Rate ($)"
                    type="number"
                    value={formik.values.hourly_rate}
                    onChange={formik.handleChange}
                    error={formik.touched.hourly_rate && Boolean(formik.errors.hourly_rate)}
                    helperText={formik.touched.hourly_rate && formik.errors.hourly_rate}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="experience_years"
                    name="experience_years"
                    label="Years of Experience"
                    type="number"
                    value={formik.values.experience_years}
                    onChange={formik.handleChange}
                    error={formik.touched.experience_years && Boolean(formik.errors.experience_years)}
                    helperText={formik.touched.experience_years && formik.errors.experience_years}
                  />
                </Grid>
              </>
            )}

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                fullWidth
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </Grid>

            {/* Login Link */}
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link component={RouterLink} to="/login" color="primary">
                    Login here
                  </Link>
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}

export default Register;
