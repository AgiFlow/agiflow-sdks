import { atom } from 'jotai';
import { IAction } from '../queries';

export const actionViewAtom = atom<IAction | undefined>(undefined);
