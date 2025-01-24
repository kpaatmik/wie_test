import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  Rating,
  Chip,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { Search as SearchIcon, LocationOn } from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';

function CaregiverSearch() {
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCaregivers();
  }, []);

  const fetchCaregivers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/account/caregivers/', {
        params: {
          search: searchTerm,
          location: location,
        },
      });
      setCaregivers(response.data);
    } catch (error) {
      console.error('Error fetching caregivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCaregivers();
  };

  const handleViewProfile = (id) => {
    navigate(`/caregivers/${id}`);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 8 }}>
        <Typography variant="h4" component="h1" color="primary" sx={{ mb: 4 }}>
          Find Your Perfect Caregiver
        </Typography>

        {/* Search Form */}
        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{
            mb: 6,
            display: 'flex',
            gap: 2,
            flexDirection: { xs: 'column', md: 'row' },
          }}
        >
          <TextField
            fullWidth
            placeholder="Search by name or specialization"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOn />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            type="submit"
            sx={{ minWidth: '120px', height: '56px' }}
          >
            Search
          </Button>
        </Box>

        {/* Results */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {caregivers.map((caregiver) => (
              <Grid item xs={12} sm={6} md={4} key={caregiver.id}>
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
                    image={caregiver.profile_picture || '/images/default-profile.jpg'}
                    alt={`${caregiver.user.first_name} ${caregiver.user.last_name}`}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="h2">
                      {caregiver.user.first_name} {caregiver.user.last_name}
                    </Typography>
                    <Box sx={{ mb: 1 }}>
                      <Rating value={caregiver.average_rating || 0} readOnly precision={0.5} />
                      <Typography variant="body2" color="text.secondary">
                        ({caregiver.total_reviews} reviews)
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      {caregiver.specializations?.map((spec) => (
                        <Chip
                          key={spec}
                          label={spec}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {caregiver.bio?.substring(0, 150)}...
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      component={Link}
                      to={`/caregivers/${caregiver.id}`}
                      sx={{ mt: 'auto' }}
                    >
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {!loading && caregivers.length === 0 && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No caregivers found. Try adjusting your search criteria.
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default CaregiverSearch;
