import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Avatar,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Rating,
  Chip,
  Tabs,
  Tab,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  School,
  Work,
  Star,
  Language,
  VerifiedUser,
  Info,
  AttachMoney,
  EventAvailable,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';

// Dummy data for a caregiver
const dummyCaregiver = {
  id: 1,
  user: {
    first_name: "Sarah",
    last_name: "Johnson",
    email: "sarah.johnson@example.com",
    phone_number: "+1 (555) 123-4567",
    city: "San Francisco",
    state: "California",
    profile_picture: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  bio: "Experienced caregiver with over 10 years of experience in prenatal and postnatal care. Specialized in high-risk pregnancies and newborn care.",
  experience_years: 10,
  hourly_rate: 45.00,
  rating: 4.8,
  total_reviews: 127,
  specializations: [
    "Prenatal Care",
    "Postnatal Care",
    "Lactation Support",
    "Newborn Care",
    "High-Risk Pregnancy"
  ],
  certifications: [
    {
      name: "Certified Nurse-Midwife (CNM)",
      issuing_organization: "American Midwifery Certification Board",
      expiry_date: "2025-12-31"
    },
    {
      name: "Certified Lactation Consultant",
      issuing_organization: "International Board of Lactation Consultant Examiners",
      expiry_date: "2024-06-30"
    }
  ],
  experiences: [
    {
      id: 1,
      title: "Senior Prenatal Care Specialist",
      organization: "City Hospital",
      start_date: "2020-01-01",
      end_date: "2023-12-31",
      description: "Provided comprehensive prenatal care and support to expecting mothers."
    },
    {
      id: 2,
      title: "Maternity Care Coordinator",
      organization: "Family Care Center",
      start_date: "2018-06-01",
      end_date: "2019-12-31",
      description: "Coordinated maternity care services and provided support to new mothers."
    }
  ],
  reviews: [
    {
      id: 1,
      rating: 5,
      reviewer_name: "Emily Wilson",
      created_at: "2023-12-15",
      comment: "Sarah was amazing! She provided excellent care during my pregnancy and was always available when I needed her."
    },
    {
      id: 2,
      rating: 5,
      reviewer_name: "Jessica Brown",
      created_at: "2023-11-30",
      comment: "Very knowledgeable and professional. Made me feel comfortable throughout my pregnancy journey."
    }
  ],
  languages: ["English", "Spanish"],
  availability: {
    monday: "9:00 AM - 5:00 PM",
    tuesday: "9:00 AM - 5:00 PM",
    wednesday: "9:00 AM - 5:00 PM",
    thursday: "9:00 AM - 5:00 PM",
    friday: "9:00 AM - 3:00 PM"
  }
};

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function CaregiverProfile() {
  const { id } = useParams();
  const [caregiver, setCaregiver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  const formatDate = (dateString) => {
    if (!dateString) return 'Present';
    try {
      const date = parseISO(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return format(date, 'MMM yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  useEffect(() => {
    // Simulate API call with setTimeout
    setLoading(true);
    const timer = setTimeout(() => {
      setCaregiver(dummyCaregiver);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          {/* Profile Header */}
          <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
            <Avatar
              src={caregiver.user.profile_picture}
              alt={`${caregiver.user.first_name} ${caregiver.user.last_name}`}
              sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}
            />
            <Typography variant="h5" gutterBottom>
              {caregiver.user.first_name} {caregiver.user.last_name}
            </Typography>
            <Rating value={caregiver.rating} precision={0.1} readOnly />
            <Typography variant="body2" color="text.secondary" gutterBottom>
              ({caregiver.total_reviews} reviews)
            </Typography>
            <Typography variant="h6" color="primary" gutterBottom>
              ${caregiver.hourly_rate}/hr
            </Typography>
          </Grid>

          {/* Quick Info */}
          <Grid item xs={12} md={9}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Email />
                </ListItemIcon>
                <ListItemText primary="Email" secondary={caregiver.user.email} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Phone />
                </ListItemIcon>
                <ListItemText primary="Phone" secondary={caregiver.user.phone_number} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LocationOn />
                </ListItemIcon>
                <ListItemText primary="Location" secondary={`${caregiver.user.city}, ${caregiver.user.state}`} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Language />
                </ListItemIcon>
                <ListItemText 
                  primary="Languages" 
                  secondary={caregiver.languages.join(', ')}
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs Section */}
      <Paper elevation={3}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab label="Overview" />
          <Tab label="Experience & Education" />
          <Tab label="Services & Rates" />
          <Tab label="Reviews" />
          <Tab label="Availability" />
        </Tabs>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>About Me</Typography>
          <Typography paragraph>{caregiver.bio}</Typography>

          <Typography variant="h6" gutterBottom>Specializations</Typography>
          <Box sx={{ mb: 3 }}>
            {caregiver.specializations.map((spec, index) => (
              <Chip
                key={index}
                label={spec}
                sx={{ m: 0.5 }}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>

          <Typography variant="h6" gutterBottom>Certifications</Typography>
          <List>
            {caregiver.certifications.map((cert, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <VerifiedUser />
                </ListItemIcon>
                <ListItemText
                  primary={cert.name}
                  secondary={
                    <>
                      {cert.issuing_organization}
                      <br />
                      Valid until: {formatDate(cert.expiry_date)}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>

        {/* Experience Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>Work Experience</Typography>
          <List>
            {caregiver.experiences.map((exp) => (
              <ListItem key={exp.id}>
                <ListItemText
                  primary={exp.title}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {exp.organization}
                      </Typography>
                      {` • ${formatDate(exp.start_date)} - ${formatDate(exp.end_date)}`}
                      <br />
                      {exp.description}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>

        {/* Services Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Services Offered</Typography>
          <List>
            {caregiver.specializations.map((service, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <Info />
                </ListItemIcon>
                <ListItemText primary={service} />
              </ListItem>
            ))}
          </List>

          <Typography variant="h6" gutterBottom>Rates</Typography>
          <ListItem>
            <ListItemIcon>
              <AttachMoney />
            </ListItemIcon>
            <ListItemText 
              primary="Hourly Rate" 
              secondary={`$${caregiver.hourly_rate} per hour`}
            />
          </ListItem>
        </TabPanel>

        {/* Reviews Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Client Reviews
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={caregiver.rating} precision={0.1} readOnly />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {caregiver.rating} out of 5 ({caregiver.total_reviews} reviews)
              </Typography>
            </Box>
          </Box>
          <List>
            {caregiver.reviews.map((review) => (
              <Box key={review.id}>
                <ListItem>
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={review.rating} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        {formatDate(review.created_at)}
                      </Typography>
                    </Box>
                    <Typography variant="body2">{review.comment}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      - {review.reviewer_name}
                    </Typography>
                  </Box>
                </ListItem>
                <Divider />
              </Box>
            ))}
          </List>
        </TabPanel>

        {/* Availability Tab */}
        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>Weekly Availability</Typography>
          <List>
            {Object.entries(caregiver.availability).map(([day, hours]) => (
              <ListItem key={day}>
                <ListItemIcon>
                  <EventAvailable />
                </ListItemIcon>
                <ListItemText 
                  primary={day.charAt(0).toUpperCase() + day.slice(1)} 
                  secondary={hours} 
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>
      </Paper>
    </Container>
  );
}

export default CaregiverProfile;
