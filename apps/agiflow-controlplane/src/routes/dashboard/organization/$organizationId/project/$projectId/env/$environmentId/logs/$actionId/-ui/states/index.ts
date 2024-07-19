import { atom } from 'jotai';

export const workflowViewAtom = atom<boolean>(false);

export interface FilterState {
  min?: number;
  spanNames: string[];
}
export const filterAtom = atom<FilterState>({ spanNames: [] });
