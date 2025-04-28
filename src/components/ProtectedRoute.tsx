import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../stores/user';

interface ProtectedRouteProps {
  role?: 'client' | 'freelancer';
  children: React.ReactNode;
}

function ProtectedRoute({ role, children }: ProtectedRouteProps) {
  const { user } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (role && user.role !== role) {
      navigate(user.role === 'client' ? '/client-dashboard' : '/freelancer-dashboard');
    }
  }, [user, role, navigate]);

  return user ? <>{children}</> : null;
}

export default ProtectedRoute;