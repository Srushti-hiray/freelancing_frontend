import { useState, useEffect, useContext } from 'react';
import { Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
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
      console.log('User object:', user);
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
    <div className="container" style={{ background: 'var(--background-color)', color: 'var(--text-color)', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Bio"
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          multiline
          rows={4}
          fullWidth
          margin="normal"
        />
        {user?.role === 'freelancer' && (
          <FormControl fullWidth margin="normal">
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
          margin="normal"
        />
        {form.profileImage && <img src={form.profileImage} alt="Profile" style={{ width: 100, height: 100, marginTop: 8 }} />}
        <Button type="submit" variant="contained" fullWidth>
          Save
        </Button>
      </form>
    </div>
  );
}

export default Profile;