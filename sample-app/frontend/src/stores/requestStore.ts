import { create } from 'zustand';

type RequestStore = {
  request: any;
  response: any;
  setRequest: (request: any) => void;
  setResponse: (response: any) => void;
};

export const useRequestStore = create<RequestStore>((set) => ({
  request: null,
  response: null,
  setRequest: (request) => set({ request }),
  setResponse: (response) => set({ response }),
}));