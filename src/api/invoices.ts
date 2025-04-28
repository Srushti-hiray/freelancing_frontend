import api from './index';

export const createInvoice = (data: { milestoneId: number; amount: number }) =>
  api.post('/invoices', data);

export const getInvoicesByMilestone = (milestoneId: number) =>
  api.get(`/invoices/milestone/${milestoneId}`);

export const updateInvoice = (id: number, data: { status: 'pending' | 'paid' }) =>
  api.patch(`/invoices/${id}`, data);

export const downloadInvoice = (id: number) =>
  api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });