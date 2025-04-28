import { create } from 'zustand';
import { Project } from '../types';

interface ProjectsStore {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
}

const useProjectsStore = create<ProjectsStore>((set) => ({
  projects: [],
  setProjects: (projects) => set({ projects }),
}));

export default useProjectsStore;