import type { Listing } from '../features/listings/types';

// The shape of the entire global state
export interface State {
  listings: Listing[];   // all listings loaded from data
  loading: boolean;      // true while simulating a fetch
  filter: string;        // current search text
  saved: string[];       // IDs of hearted listings
}

// Every possible action that can be dispatched to the store
export type Action =
  | { type: 'SET_LISTINGS'; payload: Listing[] }
  | { type: 'SET_LOADING';  payload: boolean }
  | { type: 'SET_FILTER';   payload: string }
  | { type: 'TOGGLE_FAVORITE'; payload: string }
  | { type: 'RESET' };  // clears filter + saved back to initial
