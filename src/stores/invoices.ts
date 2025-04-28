import { create } from 'zustand';
import { Invoice } from '../types';

interface InvoicesStore {
  invoices: Invoice[];
  setInvoices: (invoices: Invoice[]) => void;
}

const useInvoicesStore = create<InvoicesStore>((set) => ({
  invoices: [],
  setInvoices: (invoices) => set({ invoices }),
}));

export default useInvoicesStore;