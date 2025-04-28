import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Typography } from '@mui/material';
import { login } from '../api/auth';
import { getCurrentUser } from '../api/users';
import { SnackbarContext } from '../context/SnackbarContext';
import useUserStore from '../stores/user';

interface LoginForm {
  email: string;
  password: string;
}

function Login() {
  const [form, setForm] = useState<LoginForm>({
    email: '',
    password: '',
  });
  const { setUser } = useUserStore();
  const { showSnackbar } = useContext(SnackbarContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await login(form); // Returns { access_token, refresh_token }
      console.log('Login Response:', response);
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      console.log('Stored access_token:', localStorage.getItem('access_token'));
      const userResponse = await getCurrentUser();
      console.log('User Response:', userResponse.data);
      setUser(userResponse.data);
      showSnackbar('Login successful', 'success');
      const role = userResponse.data.role;
      if (role !== 'client' && role !== 'freelancer') {
        throw new Error('Invalid user role');
      }
      navigate(role === 'client' ? '/client-dashboard' : '/freelancer-dashboard');
    } catch (error: any) {
      console.error('Login Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      const errorMessage =
        error.response?.status === 401
          ? 'Authentication failed. Please try again.'
          : error.response?.data?.message || 'Login failed';
      showSnackbar(errorMessage, 'error');
    }
  };

  return (
    <div className="auth-container">
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          fullWidth
          margin="normal"
        />
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          Login
        </Button>
      </form>
    </div>
  );
}

export default Login;