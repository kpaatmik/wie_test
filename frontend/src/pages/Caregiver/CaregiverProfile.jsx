import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Rating,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  LocationOn,
  Phone,
  Email,
  School,
  Work,
  Star,
} from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../../api/axios';

function CaregiverProfile() {
  const { id } = useParams();
  const [caregiver, setCaregiver] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCaregiverProfile();
  }, [id]);

  const fetchCaregiverProfile = async () => {
    try {
      const response = await api.get(`/account/caregivers/${id}/`);
      setCaregiver(response.data);
    } catch (error) {
      console.error('Error fetching caregiver profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!caregiver) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Caregiver not found
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 8 }}>
        {/* Profile Header */}
        <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={3}>
              <Avatar
                src={caregiver.profile_picture || '/images/default-profile.jpg'}
                alt={`${caregiver.user.first_name} ${caregiver.user.last_name}`}
                sx={{ width: 200, height: 200, mx: 'auto' }}
              />
            </Grid>
            <Grid item xs={12} md={9}>
              <Typography variant="h4" component="h1" gutterBottom>
                {caregiver.user.first_name} {caregiver.user.last_name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating value={caregiver.average_rating || 0} readOnly precision={0.5} />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  ({caregiver.total_reviews} reviews)
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                {caregiver.specializations?.map((spec) => (
                  <Chip
                    key={spec}
                    label={spec}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
              <Typography variant="body1" paragraph>
                {caregiver.bio}
              </Typography>
              <Button variant="contained" color="primary">
                Contact Caregiver
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={4}>
          {/* Experience and Education */}
          <Grid item xs={12} md={8}>
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Work sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Experience
                </Typography>
                <List>
                  {caregiver.experiences?.map((exp) => (
                    <ListItem key={exp.id}>
                      <ListItemText
                        primary={exp.title}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              {exp.organization}
                            </Typography>
                            {` • ${format(new Date(exp.start_date), 'MMM yyyy')} - ${
                              exp.end_date
                                ? format(new Date(exp.end_date), 'MMM yyyy')
                                : 'Present'
                            }`}
                            <br />
                            {exp.description}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <School sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Education
                </Typography>
                <List>
                  {caregiver.education?.map((edu) => (
                    <ListItem key={edu.id}>
                      <ListItemText
                        primary={edu.degree}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              {edu.institution}
                            </Typography>
                            {` • ${format(new Date(edu.graduation_date), 'yyyy')}`}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Contact Info and Reviews */}
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Contact Information
                </Typography>
                <List>
                  <ListItem>
                    <LocationOn sx={{ mr: 2 }} />
                    <ListItemText
                      primary="Location"
                      secondary={`${caregiver.user.city}, ${caregiver.user.state}`}
                    />
                  </ListItem>
                  <ListItem>
                    <Phone sx={{ mr: 2 }} />
                    <ListItemText
                      primary="Phone"
                      secondary={caregiver.user.phone_number}
                    />
                  </ListItem>
                  <ListItem>
                    <Email sx={{ mr: 2 }} />
                    <ListItemText primary="Email" secondary={caregiver.user.email} />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Star sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Recent Reviews
                </Typography>
                <List>
                  {caregiver.reviews?.slice(0, 3).map((review) => (
                    <Box key={review.id}>
                      <ListItem>
                        <Box sx={{ width: '100%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Rating value={review.rating} readOnly size="small" />
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                              {format(new Date(review.created_at), 'MMM d, yyyy')}
                            </Typography>
                          </Box>
                          <Typography variant="body2">{review.comment}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            By {review.user.first_name} {review.user.last_name}
                          </Typography>
                        </Box>
                      </ListItem>
                      <Divider />
                    </Box>
                  ))}
                </List>
                {caregiver.reviews?.length > 3 && (
                  <Button
                    fullWidth
                    sx={{ mt: 2 }}
                    variant="outlined"
                  >
                    View All Reviews
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default CaregiverProfile;
