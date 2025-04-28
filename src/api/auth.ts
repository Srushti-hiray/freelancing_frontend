import api from './index';

// export const login = (data: { email: string; password: string }) =>
//   api.post('/auth/login', data);
export const login = (data: { email: string; password: string }) =>
    api.post('/auth/login', data).then((response) => ({
      access_token: response.data.accessToken || response.data.access_token,
      refresh_token: response.data.refreshToken || response.data.refresh_token,
    }));

export const register = (data: { name: string; email: string; password: string; role: 'client' | 'freelancer' }) =>
  api.post('/auth/register', data);

export const refreshToken = (refreshToken: string) =>
  api.post('/auth/refresh', { refreshToken });