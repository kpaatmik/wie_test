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
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function Home() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();

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

        {user?.user_type === 'pregnant' && (
          <Box sx={{ mt: 6, textAlign: 'center' }}>
            <Typography variant="h4" color="primary" sx={{ mb: 3 }}>
              Need Support?
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate('/caregivers')}
              sx={{ mr: 2 }}
            >
              Find a Caregiver
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              onClick={() => navigate('/sessions')}
            >
              Book Expert Session
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default Home;
