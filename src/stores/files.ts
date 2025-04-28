import { create } from 'zustand';
import { ProjectFile } from '../types';

interface FilesStore {
  files: ProjectFile[];
  setFiles: (files: ProjectFile[]) => void;
}

const useFilesStore = create<FilesStore>((set) => ({
  files: [],
  setFiles: (files) => set({ files }),
}));

export default useFilesStore;