import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Button,
  Container,
  Box,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

function Home() {
  const navigate = useNavigate();
  const theme = useTheme();

  const features = [
    {
      icon: <WorkIcon sx={{ fontSize: 40 }} />,
      title: 'Find Work',
      description: 'Browse thousands of job postings and find your next opportunity',
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      title: 'Hire Talent',
      description: 'Connect with skilled freelancers for your projects',
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      title: 'Grow Your Career',
      description: 'Build your portfolio and grow your freelance business',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          color: 'white',
          py: 8,
          mb: 6,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 4,
              alignItems: 'center',
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant="h2" component="h1" gutterBottom>
                Welcome to SkillSync
              </Typography>
              <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
                Connect with top freelancers or post your projects today!
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/login')}
                sx={{ mr: 2, bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
              >
                Login
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/register')}
                sx={{ borderColor: 'white', color: 'white', '&:hover': { borderColor: 'grey.100', bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                Register
              </Button>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box
                component="img"
                src="https://img.freepik.com/free-vector/freelancer-working-laptop-home_23-2148505081.jpg"
                alt="Freelancer working"
                sx={{
                  width: '100%',
                  maxWidth: 500,
                  height: 'auto',
                  borderRadius: 2,
                  boxShadow: 3,
                }}
              />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Why Choose SkillSync?
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 4,
            mt: 2,
          }}
        >
          {features.map((feature, index) => (
            <Box key={index} sx={{ flex: 1 }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Container>

      {/* Statistics Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 4,
              justifyContent: 'center',
            }}
          >
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography variant="h3" color="primary" gutterBottom>
                10K+
              </Typography>
              <Typography variant="h6">Active Freelancers</Typography>
            </Box>
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography variant="h3" color="primary" gutterBottom>
                5K+
              </Typography>
              <Typography variant="h6">Projects Completed</Typography>
            </Box>
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography variant="h3" color="primary" gutterBottom>
                98%
              </Typography>
              <Typography variant="h6">Client Satisfaction</Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default Home;