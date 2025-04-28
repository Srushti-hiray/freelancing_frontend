import api from './index';

export const uploadFile = (projectId: number, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/files/upload/${projectId}`, formData);
};

export const getFilesByProject = (projectId: number) =>
  api.get(`/files/project/${projectId}`);

export const downloadFile = (fileId: number) =>
  api.get(`/files/${fileId}`, { responseType: 'blob' });