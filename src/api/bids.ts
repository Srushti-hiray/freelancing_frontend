import api from './index';

export const createBid = (data: { projectId: number; amount: number; duration: number; message: string }) =>
  api.post('/bids', data);

export const getBidsByProject = (projectId: number) =>
  api.get(`/bids/project/${projectId}`);