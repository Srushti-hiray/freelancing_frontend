import api from './index';

export const sendMessage = (data: { projectId: number; receiverId: number; content: string }) =>
  api.post('/messages', data);

export const getMessagesByProject = (projectId: number) =>
  api.get(`/messages/project/${projectId}`);