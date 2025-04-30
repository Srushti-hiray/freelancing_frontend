import api from './index';

export const getProjects = (params?: {
  category?: string;
  minBudget?: number;
  maxBudget?: number;
  minDeadline?: string;
  freelancerId?: number;
  clientId?: number;
}) => {
  const query = new URLSearchParams();
  
  // Handle category
  if (params?.category) {
    query.append('category', params.category);
  }

  // Handle minBudget
  if (params?.minBudget !== undefined) {
    const minBudget = Number(params.minBudget);
    if (!isNaN(minBudget) && minBudget >= 0) {
      query.append('minBudget', minBudget.toString());
    }
  }

  // Handle maxBudget
  if (params?.maxBudget !== undefined) {
    const maxBudget = Number(params.maxBudget);
    if (!isNaN(maxBudget) && maxBudget >= 0) {
      query.append('maxBudget', maxBudget.toString());
    }
  }

  // Handle minDeadline
  if (params?.minDeadline) {
    const date = new Date(params.minDeadline);
    if (!isNaN(date.getTime())) {
      query.append('minDeadline', params.minDeadline);
    }
  }

  // Handle freelancerId
  if (params?.freelancerId) {
    query.append('freelancerId', params.freelancerId.toString());
  }

  // Handle clientId
  if (params?.clientId) {
    query.append('clientId', params.clientId.toString());
  }

  const queryString = query.toString();
  return api.get(`/projects${queryString ? `?${queryString}` : ''}`).then(response => ({
    data: response.data || []
  }));
};

export const createProject = (data: {
  title: string;
  category: string;
  description: string;
  budget: number;
  deadline: string;
  clientId: number;
}) => api.post('/projects', data);

export const updateProject = (id: number, data: Partial<{ title: string; category: string; description: string; budget: number; deadline: string; freelancerId?: number; }>) =>
  api.patch(`/projects/${id}`, data);

export const getProjectById = (id: number) => api.get(`/projects/${id}`);

export const deleteProject = (id: number) => api.delete(`/projects/${id}`);

export const getProjectCountByFreelancer = (freelancerId: number) =>
  api.get(`/projects/count?freelancerId=${freelancerId}`);