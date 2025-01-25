import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const validationSchema = Yup.object({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
});

function Login() {
  const theme = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      try {
        const result = await login(values);
        if (result.success) {
          toast.success('Login successful!');
          navigate('/', { replace: true });
        } else {
          setError(result.error);
        }
      } catch (error) {
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Box
      sx={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '400px',
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
          Welcome Back
        </Typography>
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
            {error}
          </Alert>
        )}
        <form onSubmit={formik.handleSubmit} style={{ width: '100%'  }}>
          <TextField
            fullWidth
            id="username"
            name="username"
            label="Username"
            value={formik.values.username}
            onChange={formik.handleChange}
            error={formik.touched.username && Boolean(formik.errors.username)}
            helperText={formik.touched.username && formik.errors.username}
            sx={{ mb: 2 }}
          />
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
            sx={{ mb: 3 }}
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ mb: 2 }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link component={RouterLink} to="/register" color="primary">
                Register here
              </Link>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}

export default Login;
