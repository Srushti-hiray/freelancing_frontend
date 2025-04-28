import { create } from 'zustand';
import { User } from '../types';

interface FreelancersStore {
  freelancers: User[];
  setFreelancers: (freelancers: User[]) => void;
}

const useFreelancersStore = create<FreelancersStore>((set) => ({
  freelancers: [],
  setFreelancers: (freelancers) => set({ freelancers }),
}));

export default useFreelancersStore;