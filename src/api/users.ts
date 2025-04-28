import api from './index';

export const getCurrentUser = () => api.get('/users/me');

export const updateUser = (data: { name?: string; bio?: string; skills?: string[]; profileImage?: string }) =>
  api.patch('/users/me', data);

export const getFreelancers = (skills: string[]) =>
  api.get(`/users/freelancers?skills=${skills.join(',')}`);