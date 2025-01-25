import { useState, useEffect } from 'react';
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
  InputAdornment,
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
  phone_number: Yup.string()
    .required('Phone number is required')
    .matches(/^[0-9+\-() ]+$/, 'Invalid phone number format'),
  address: Yup.string().required('Address is required'),
  city: Yup.string().required('City is required'),
  state: Yup.string().required('State is required'),
  user_type: Yup.string().required('Please select a user type'),
  profile_picture: Yup.mixed(),
  // Conditional validation for caregiver fields
  bio: Yup.string().when('user_type', {
    is: 'caregiver',
    then: () => Yup.string()
      .required('Bio is required for caregivers')
      .min(50, 'Bio must be at least 50 characters'),
    otherwise: () => Yup.string().nullable(),
  }),
  hourly_rate: Yup.number().when('user_type', {
    is: 'caregiver',
    then: () => 
      Yup.number()
        .required('Hourly rate is required for caregivers')
        .min(0, 'Hourly rate must be positive'),
    otherwise: () => Yup.number().nullable(),
  }),
  experience_years: Yup.number().when('user_type', {
    is: 'caregiver',
    then: () => 
      Yup.number()
        .required('Experience years is required for caregivers')
        .min(0, 'Experience years must be positive')
        .integer('Experience years must be a whole number'),
    otherwise: () => Yup.number().nullable(),
  }),
  certifications: Yup.array().when('user_type', {
    is: 'caregiver',
    then: () => Yup.array().of(Yup.string()),
    otherwise: () => Yup.array().nullable(),
  }),
  specializations: Yup.array().when('user_type', {
    is: 'caregiver',
    then: () => Yup.array().of(Yup.string()),
    otherwise: () => Yup.array().nullable(),
  }),
  // Pregnant woman specific fields
  due_date: Yup.date().when('user_type', {
    is: 'pregnant',
    then: () => Yup.date().nullable(),
    otherwise: () => Yup.date().nullable(),
  }),
  pregnancy_week: Yup.number().when('user_type', {
    is: 'pregnant',
    then: () => 
      Yup.number()
        .required('Pregnancy week is required')
        .min(1, 'Week must be at least 1')
        .max(42, 'Week cannot exceed 42')
        .integer('Week must be a whole number'),
    otherwise: () => Yup.number().nullable(),
  }),
  medical_conditions: Yup.array().when('user_type', {
    is: 'pregnant',
    then: () => Yup.array().of(Yup.string()),
    otherwise: () => Yup.array().nullable(),
  }),
  preferences: Yup.object().when('user_type', {
    is: 'pregnant',
    then: () => Yup.object(),
    otherwise: () => Yup.object().nullable(),
  }),
}).test('caregiver-fields', null, function(values) {
  if (values.user_type === 'caregiver') {
    const errors = {};
    if (!values.bio) errors.bio = 'Bio is required for caregivers';
    if (!values.hourly_rate) errors.hourly_rate = 'Hourly rate is required for caregivers';
    if (!values.experience_years) errors.experience_years = 'Experience years is required for caregivers';
    return Object.keys(errors).length ? new Yup.ValidationError(errors) : true;
  }
  return true;
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
      profile_picture: null,
      // Caregiver specific fields
      bio: '',
      hourly_rate: '',
      experience_years: '',
      certifications: [],
      specializations: [],
      // Pregnant woman specific fields
      due_date: null,
      pregnancy_week: '',
      medical_conditions: [],
      preferences: {},
    },
    validationSchema,
    validateOnMount: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      try {
        const formData = new FormData();
        Object.keys(values).forEach(key => {
          if (values[key] !== null && values[key] !== undefined) {
            if (key === 'profile_picture' && values[key]) {
              formData.append(key, values[key]);
            } else if (Array.isArray(values[key])) {
              formData.append(key, JSON.stringify(values[key]));
            } else if (typeof values[key] === 'object' && values[key] !== null) {
              formData.append(key, JSON.stringify(values[key]));
            } else {
              formData.append(key, values[key]);
            }
          }
        });

        const result = await register(formData);
        if (result.success) {
          toast.success('Registration successful!');
        } else {
          if (typeof result.error === 'object') {
            const errorMessages = [];
            for (const [field, messages] of Object.entries(result.error)) {
              errorMessages.push(`${field}: ${messages.join(', ')}`);
            }
            setError(errorMessages.join('\n'));
          } else {
            setError(result.error);
          }
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    },
  });

  const handleFileChange = (event) => {
    formik.setFieldValue('profile_picture', event.currentTarget.files[0]);
  };

  // Debug validation
  useEffect(() => {
    if (formik.isSubmitting) {
      console.log('Form Values:', formik.values);
      console.log('Form Errors:', formik.errors);
      console.log('Form Touched:', formik.touched);
    }
  }, [formik.isSubmitting]);

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
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Register
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={2}>
              {/* Basic User Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Basic Information</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
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
                  name="email"
                  label="Email"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
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
                  name="password2"
                  label="Confirm Password"
                  type="password"
                  value={formik.values.password2}
                  onChange={formik.handleChange}
                  error={formik.touched.password2 && Boolean(formik.errors.password2)}
                  helperText={formik.touched.password2 && formik.errors.password2}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
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
                  name="last_name"
                  label="Last Name"
                  value={formik.values.last_name}
                  onChange={formik.handleChange}
                  error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                  helperText={formik.touched.last_name && formik.errors.last_name}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="phone_number"
                  label="Phone Number"
                  value={formik.values.phone_number}
                  onChange={formik.handleChange}
                  error={formik.touched.phone_number && Boolean(formik.errors.phone_number)}
                  helperText={formik.touched.phone_number && formik.errors.phone_number}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="address"
                  label="Address"
                  multiline
                  rows={2}
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  error={formik.touched.address && Boolean(formik.errors.address)}
                  helperText={formik.touched.address && formik.errors.address}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
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
                  name="state"
                  label="State"
                  value={formik.values.state}
                  onChange={formik.handleChange}
                  error={formik.touched.state && Boolean(formik.errors.state)}
                  helperText={formik.touched.state && formik.errors.state}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">User Type</FormLabel>
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

              <Grid item xs={12}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="profile-picture"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="profile-picture">
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                  >
                    Upload Profile Picture
                  </Button>
                </label>
                {formik.values.profile_picture && (
                  <Typography variant="caption" display="block" gutterBottom>
                    Selected file: {formik.values.profile_picture.name}
                  </Typography>
                )}
              </Grid>

              {/* Caregiver Specific Fields */}
              {formik.values.user_type === 'caregiver' && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Caregiver Information</Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="bio"
                      label="Bio"
                      multiline
                      rows={4}
                      value={formik.values.bio}
                      onChange={formik.handleChange}
                      error={formik.touched.bio && Boolean(formik.errors.bio)}
                      helperText={
                        (formik.touched.bio && formik.errors.bio) ||
                        'Minimum 50 characters. Describe your experience and qualifications.'
                      }
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="hourly_rate"
                      label="Hourly Rate ($)"
                      type="number"
                      value={formik.values.hourly_rate}
                      onChange={formik.handleChange}
                      error={formik.touched.hourly_rate && Boolean(formik.errors.hourly_rate)}
                      helperText={formik.touched.hourly_rate && formik.errors.hourly_rate}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="experience_years"
                      label="Years of Experience"
                      type="number"
                      value={formik.values.experience_years}
                      onChange={formik.handleChange}
                      error={formik.touched.experience_years && Boolean(formik.errors.experience_years)}
                      helperText={formik.touched.experience_years && formik.errors.experience_years}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="certifications"
                      label="Certifications"
                      placeholder="Enter certifications separated by commas"
                      value={Array.isArray(formik.values.certifications) ? formik.values.certifications.join(', ') : ''}
                      onChange={(e) => {
                        const certifications = e.target.value.split(',').map(cert => cert.trim()).filter(Boolean);
                        formik.setFieldValue('certifications', certifications);
                      }}
                      helperText="Example: RN, CPR Certified, First Aid"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="specializations"
                      label="Specializations"
                      placeholder="Enter specializations separated by commas"
                      value={Array.isArray(formik.values.specializations) ? formik.values.specializations.join(', ') : ''}
                      onChange={(e) => {
                        const specializations = e.target.value.split(',').map(spec => spec.trim()).filter(Boolean);
                        formik.setFieldValue('specializations', specializations);
                      }}
                      helperText="Example: Prenatal Care, Postpartum Care, High-Risk Pregnancy"
                    />
                  </Grid>
                </>
              )}

              {/* Pregnant Woman Specific Fields */}
              {formik.values.user_type === 'pregnant' && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Pregnancy Information</Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="pregnancy_week"
                      label="Current Week of Pregnancy"
                      type="number"
                      value={formik.values.pregnancy_week}
                      onChange={formik.handleChange}
                      error={formik.touched.pregnancy_week && Boolean(formik.errors.pregnancy_week)}
                      helperText={formik.touched.pregnancy_week && formik.errors.pregnancy_week}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="due_date"
                      label="Due Date"
                      type="date"
                      value={formik.values.due_date || ''}
                      onChange={formik.handleChange}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="medical_conditions"
                      label="Medical Conditions"
                      placeholder="Enter medical conditions separated by commas"
                      value={Array.isArray(formik.values.medical_conditions) ? formik.values.medical_conditions.join(', ') : ''}
                      onChange={(e) => {
                        const conditions = e.target.value.split(',').map(condition => condition.trim()).filter(Boolean);
                        formik.setFieldValue('medical_conditions', conditions);
                      }}
                      helperText="Example: Gestational Diabetes, Hypertension"
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  disabled={loading || (!formik.isValid && formik.touched)}
                  onClick={formik.handleSubmit}
                  sx={{ mt: 2 }}
                >
                  {loading ? 'Registering...' : 'Register'}
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2" align="center">
                  Already have an account?{' '}
                  <Link component={RouterLink} to="/login">
                    Login here
                  </Link>
                </Typography>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}

export default Register;
