import { atom } from 'recoil';
import { Principal } from '@dfinity/principal';

export const userState = atom({
  key: 'userState',
  default: {
    id: null,
    balance: 0,
  },
});