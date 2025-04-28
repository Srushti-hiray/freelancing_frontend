import { create } from 'zustand';
import { Bid } from '../types';

interface BidsStore {
  bids: Bid[];
  setBids: (bids: Bid[]) => void;
}

const useBidsStore = create<BidsStore>((set) => ({
  bids: [],
  setBids: (bids) => set({ bids }),
}));

export default useBidsStore;