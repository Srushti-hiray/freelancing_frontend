import api from './index';

export const getCurrentUser = () => api.get('/users/me');

export const updateUser = (data: { name?: string; bio?: string; skills?: string[]; profileImage?: string }) =>
  api.patch('/users/me', data);

export const getFreelancers = async (skills: string[]) => {
  try {
   
    const skillsString = skills.join(',');
    const url = `/users/freelancers?skills=${encodeURIComponent(skillsString)}`;
    
    const response = await api.get(url);
    
    return response;
  } catch (error) {
 
    throw error;
  }
};