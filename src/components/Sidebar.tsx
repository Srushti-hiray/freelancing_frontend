import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, ListItem, ListItemButton, ListItemText, FormControlLabel, Switch } from '@mui/material';
import useUserStore from '../stores/user';
import { ThemeContext } from '../context/ThemeContext';

function Sidebar() {
  const { user, clearUser } = useUserStore();
  const { mode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    clearUser();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <List>
        <ListItem>
          <ListItemButton onClick={() => navigate(user?.role === 'client' ? '/client-dashboard' : '/freelancer-dashboard')}>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
        <ListItem>
          <ListItemButton onClick={() => navigate('/profile')}>
            <ListItemText primary="Profile" />
          </ListItemButton>
        </ListItem>
        <ListItem>
          <FormControlLabel
            control={<Switch checked={mode === 'dark'} onChange={toggleTheme} />}
            label="Dark Mode"
          />
        </ListItem>
        <ListItem>
          <ListItemButton onClick={handleLogout}>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );
}

export default Sidebar;