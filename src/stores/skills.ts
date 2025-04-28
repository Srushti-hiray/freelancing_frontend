import { create } from 'zustand';
import { Skill } from '../types';

interface SkillsStore {
  skills: Skill[];
  setSkills: (skills: Skill[]) => void;
}

const useSkillsStore = create<SkillsStore>((set) => ({
  skills: [],
  setSkills: (skills) => set({ skills }),
}));

export default useSkillsStore;