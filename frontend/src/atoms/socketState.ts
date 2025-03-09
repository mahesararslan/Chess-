// src/state/socketState.ts
import { atom } from 'recoil';

export type SocketState = WebSocket | null;

export const socketState = atom<SocketState>({
  key: 'socketState',
  default: null,
});
