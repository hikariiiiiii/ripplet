import { create } from 'zustand';

interface XamanTxState {
  isOpen: boolean;
  qrUrl: string | null;
  payloadUrl: string | null;
  scanned: boolean;
  cancelled: boolean;
  show: (qrUrl: string, payloadUrl: string) => void;
  setScanned: () => void;
  cancel: () => void;
  close: () => void;
}

export const useXamanTxStore = create<XamanTxState>()((set) => ({
  isOpen: false,
  qrUrl: null,
  payloadUrl: null,
  scanned: false,
  cancelled: false,
  show: (qrUrl, payloadUrl) => set({ isOpen: true, qrUrl, payloadUrl, scanned: false, cancelled: false }),
  setScanned: () => set({ scanned: true }),
  cancel: () => set({ isOpen: false, qrUrl: null, payloadUrl: null, scanned: false, cancelled: true }),
  close: () => set({ isOpen: false, qrUrl: null, payloadUrl: null, scanned: false, cancelled: false }),
}));