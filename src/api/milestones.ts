import api from './index';

export const createMilestone = (data: { projectId: number; title: string; dueDate: string; amount: number }) =>
  api.post('/milestones', data);

export const getMilestonesByProject = (projectId: number) =>
  api.get(`/milestones/project/${projectId}`);

export const updateMilestone = (id: number, data: { status: 'pending' | 'completed' | 'paid' }) =>
  api.patch(`/milestones/${id}`, data);