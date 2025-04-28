import { create } from 'zustand';
import { Milestone } from '../types';

interface MilestonesStore {
  milestones: Milestone[];
  setMilestones: (milestones: Milestone[]) => void;
}

const useMilestonesStore = create<MilestonesStore>((set) => ({
  milestones: [],
  setMilestones: (milestones) => set({ milestones }),
}));

export default useMilestonesStore;