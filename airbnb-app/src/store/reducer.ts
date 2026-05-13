import type { State, Action } from './types';

// Pure function: takes current state + action, returns NEW state (never mutates)
export function reducer(state: State, action: Action): State {
  switch (action.type) {

    case 'SET_LISTINGS':
      return { ...state, listings: action.payload };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_FILTER':
      return { ...state, filter: action.payload };

    case 'TOGGLE_FAVORITE': {
      const id = action.payload;
      const alreadySaved = state.saved.includes(id);
      return {
        ...state,
        saved: alreadySaved
          ? state.saved.filter(savedId => savedId !== id)
          : [...state.saved, id],
      };
    }

    case 'RESET':
      return { ...state, filter: '', saved: [] };

    default:
      return state;
  }
}
