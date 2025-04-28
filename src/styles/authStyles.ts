import { styled } from '@mui/material/styles';
import { Paper } from '@mui/material';

export const AuthSection = styled('div')({
  minHeight: '100vh',
  width: '100%',
  backgroundImage: 'url("https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export const StyledPaper = styled(Paper)({
  padding: '2rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
});

export const formStyles = {
  textField: {
    '& .MuiOutlinedInput-root': {
      '&:hover fieldset': {
        borderColor: '#1976d2',
      },
    },
  },
  button: {
    mt: 3,
    mb: 2,
    py: 1.5,
    fontSize: '1.1rem',
    backgroundColor: '#1976d2',
    '&:hover': {
      backgroundColor: '#1565c0'
    }
  },
  link: {
    color: '#1976d2',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline'
    }
  },
  heading: {
    fontWeight: 700,
    color: '#1976d2',
    mb: 3
  },
  subheading: {
    mb: 4,
    color: 'text.secondary',
    textAlign: 'center'
  }
}; 