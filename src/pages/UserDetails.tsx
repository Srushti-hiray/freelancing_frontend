import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, CircularProgress, Card, CardContent, Avatar, Grid, Chip, Box } from '@mui/material';
import { SnackbarContext } from '../context/SnackbarContext';
import api from '../api';
import { User } from '../types';

function UserDetails() {
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { showSnackbar } = useContext(SnackbarContext);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        if (id) {
          const { data } = await api.get(`/users/${parseInt(id, 10)}`);
          setUser(data);
        }
      } catch (error: any) {
        showSnackbar(error.response?.data?.message || 'Failed to load user details', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', background: 'var(--background-color)', color: 'var(--text-color)' }}>
        <CircularProgress />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container" style={{ background: 'var(--background-color)', color: 'var(--text-color)', minHeight: '100vh' }}>
        <Typography variant="h5">User not found</Typography>
      </div>
    );
  }

  return (
    <Box className="container" sx={{ background: 'var(--background-color)', color: 'var(--text-color)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Card sx={{ maxWidth: 700, width: '100%', p: 4, boxShadow: 3, borderRadius: 3 }}>
        <CardContent>
          <Grid container spacing={2} direction="column" alignItems="center">
            <Grid item>
              <Avatar
                src={user.profile_Image || user.profileImage || undefined}
                alt={user.name}
                sx={{ width: 150, height: 150, mb: 2, fontSize: 56 }}
              >
                {user.name[0]}
              </Avatar>
            </Grid>
            <Grid item>
              <Typography variant="h5" gutterBottom align="center">
                {user.name}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" align="center" gutterBottom>
                {user.role === 'freelancer' ? 'Freelancer' : 'Client'}
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="body1" align="center" paragraph>
                {user.bio || 'No bio available'}
              </Typography>
            </Grid>
            {user.skills && user.skills.length > 0 && (
              <Grid item>
                <Typography variant="subtitle2" gutterBottom align="center">
                  Skills
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                  {user.skills.map((skill) => (
                    <Chip key={skill} label={skill} color="primary" variant="outlined" />
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}

export default UserDetails; 