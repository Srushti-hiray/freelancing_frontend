import { useState, useEffect, useContext } from 'react';
import {
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Box,
  Avatar,
  Stack,
  Divider
} from '@mui/material';
import useUserStore from '../stores/user';
import useSkillsStore from '../stores/skills';
import { SnackbarContext } from '../context/SnackbarContext';
import { updateUser, getCurrentUser } from '../api/users';
import { uploadFile } from '../api/files';
import { Skill } from '../types';
import { getSkills } from '../api/skills';

function Profile() {
  const { user, setUser } = useUserStore();
  const { skills } = useSkillsStore();
  const [form, setForm] = useState({ name: '', bio: '', skills: [] as string[], profileImage: '' });
  const [file, setFile] = useState<File | null>(null);
  const { showSnackbar } = useContext(SnackbarContext);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        bio: user.bio || '',
        skills: user.skills || [],
        profileImage: user.profile_Image || '',
      });
    }
  }, [user]);

  useEffect(() => {
    getSkills().then(({ data }) => useSkillsStore.getState().setSkills(data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const profile_image = form.profileImage;
      const updateData = user?.role === 'client' ? { name: form.name, bio: form.bio, profile_image } : { ...form, profile_image };
      const { data } = await updateUser(updateData);
      setUser(data);
      showSnackbar('Profile updated', 'success');
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Update failed', 'error');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f6fa', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}>
      <Card sx={{ maxWidth: 600, width: '100%', borderRadius: 3, boxShadow: 3, p: { xs: 2, sm: 4 } }}>
        <CardContent>
          <Stack spacing={3} alignItems="center">
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
              Profile
            </Typography>
            <Divider sx={{ width: '100%' }} />
            <Avatar
              src={form.profileImage}
              alt={form.name}
              sx={{ width: 100, height: 100, mb: 1, bgcolor: 'primary.light', fontSize: 40 }}
            >
              {(!form.profileImage && form.name) ? form.name[0].toUpperCase() : ''}
            </Avatar>
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <Stack spacing={2}>
                <TextField
                  label="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  fullWidth
                  margin="none"
                />
                <TextField
                  label="Bio"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  multiline
                  rows={3}
                  fullWidth
                  margin="none"
                />
                {user?.role === 'freelancer' && (
                  <FormControl fullWidth>
                    <InputLabel>Skills</InputLabel>
                    <Select
                      multiple
                      value={form.skills}
                      onChange={(e) => setForm({ ...form, skills: e.target.value as string[] })}
                      renderValue={(selected) => selected.join(', ')}
                    >
                      {skills.map((skill: Skill) => (
                        <MenuItem key={skill.id} value={skill.name}>
                          {skill.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                <TextField
                  label="Profile Image URL"
                  value={form.profileImage}
                  onChange={(e) => setForm({ ...form, profileImage: e.target.value })}
                  fullWidth
                  margin="none"
                />
                <Button type="submit" variant="contained" size="large" fullWidth sx={{ borderRadius: 2, py: 1.2, fontWeight: 600 }}>
                  Save
                </Button>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Profile;