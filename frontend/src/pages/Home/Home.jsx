import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  useTheme,
} from '@mui/material';

function Home() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      if (user.user_type === 'pregnant') {
        navigate('/pregnant/dashboard', { replace: true });
      } else if (user.user_type === 'caregiver') {
        navigate('/caregiver/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  if (user?.user_type === 'pregnant' || user?.user_type === 'caregiver') {
    return null; // Don't render anything while redirecting
  }

  const features = [
    {
      title: 'Find Caregivers',
      description: 'Connect with experienced caregivers in your area',
      image: '/images/caregiver.jpg',
      path: '/caregivers',
    },
    {
      title: 'Expert Sessions',
      description: 'Book sessions with pregnancy and childcare experts',
      image: '/images/expert.jpg',
      path: '/sessions',
    },
    {
      title: 'Community',
      description: 'Join our supportive community of mothers and caregivers',
      image: '/images/community.jpg',
      path: '/social',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 8 }}>
        <Typography
          variant="h3"
          component="h1"
          color="primary"
          sx={{ mb: 2, fontWeight: 600 }}
        >
          Welcome{user?.first_name ? `, ${user.first_name}` : ''}!
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 6 }}>
          Your journey to motherhood, supported every step of the way
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature) => (
            <Grid item xs={12} md={4} key={feature.title}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={feature.image}
                  alt={feature.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography
                    gutterBottom
                    variant="h5"
                    component="h2"
                    color="primary"
                  >
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    {feature.description}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(feature.path)}
                  >
                    Explore
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}

export default Home;
