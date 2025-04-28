import { useNavigate } from 'react-router-dom';
import { Typography, Button } from '@mui/material';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <Typography variant="h2" gutterBottom>
        Welcome to SkillSync
      </Typography>
      <Typography variant="h5" gutterBottom>
        Connect with top freelancers or post your projects today!
      </Typography>
      <Button variant="contained" onClick={() => navigate('/login')} sx={{ mr: 2 }}>
        Login
      </Button>
      <Button variant="outlined" onClick={() => navigate('/register')}>
        Register
      </Button>
    </div>
  );
}

export default Home;