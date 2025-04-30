import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import {
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  Box,
  Chip,
  Stack,
  Divider
} from '@mui/material';
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', bgcolor: '#f5f6fa' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ bgcolor: '#f5f6fa', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="h5">User not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f5f6fa', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
      <Card sx={{ maxWidth: 600, width: '100%', borderRadius: 3, boxShadow: 3, p: { xs: 2, sm: 4 } }}>
        <CardContent>
          <Stack spacing={3} alignItems="center">
            <Avatar
              src={user.profile_Image || user.profileImage || undefined}
              alt={user.name}
              sx={{ width: 120, height: 120, mb: 1, boxShadow: 2, border: '4px solid #e3f2fd', fontSize: 48, bgcolor: 'primary.light' }}
            >
              {(!user.profile_Image && !user.profileImage && user.name) ? user.name[0].toUpperCase() : ''}
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', textAlign: 'center' }}>
              {user.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ textAlign: 'center' }}>
              {user.role === 'freelancer' ? 'Freelancer' : 'Client'}
            </Typography>
            <Divider sx={{ width: '100%' }} />
            <Typography variant="body1" sx={{ textAlign: 'center' }}>
              {user.bio || 'No bio available'}
            </Typography>
            {user.skills && user.skills.length > 0 && (
              <Box sx={{ width: '100%' }}>
                <Typography variant="subtitle2" sx={{ mb: 1, textAlign: 'center', fontWeight: 600 }}>
                  Skills
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
                  {user.skills.map((skill) => (
                    <Chip key={skill} label={skill} color="primary" variant="filled" sx={{ mb: 1 }} />
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export default UserDetails; 