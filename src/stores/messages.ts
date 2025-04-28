import { create } from 'zustand';
import { Message } from '../types';

interface MessagesStore {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
}

const useMessagesStore = create<MessagesStore>((set) => ({
  messages: [],
  setMessages: (messages) => set({ messages }),
}));

export default useMessagesStore;