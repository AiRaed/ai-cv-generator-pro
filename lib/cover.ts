import { create } from "zustand";

interface CoverState {
  recipientName: string;
  company: string;
  role: string;
  letter: string;
  setRecipientName: (name: string) => void;
  setCompany: (company: string) => void;
  setRole: (role: string) => void;
  setLetter: (letter: string) => void;
}

export const useCoverStore = create<CoverState>((set) => ({
  recipientName: "",
  company: "",
  role: "",
  letter: "",
  setRecipientName: (name) => set({ recipientName: name }),
  setCompany: (company) => set({ company }),
  setRole: (role) => set({ role }),
  setLetter: (letter) => set({ letter }),
}));
