"use client";

import { create } from 'zustand';

interface LoadingBarStore {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

export const useLoadingBar = create<LoadingBarStore>((set) => ({
  isLoading: false,
  startLoading: () => set((state) => ({ ...state, isLoading: true })),
  stopLoading: () => set((state) => ({ ...state, isLoading: false })),
})); 