import { createContext, useContext, useReducer } from 'react';
import type { Dispatch, ReactNode } from 'react';
import { reducer } from './reducer';
import type { State, Action } from './types';

// ── Initial state ────────────────────────────────────────────────────────────
const initialState: State = {
  listings: [],
  loading: true,   // start as true so spinner shows immediately
  filter: '',
  saved: [],
};

// ── Context shape ────────────────────────────────────────────────────────────
interface StoreContextValue {
  state: State;
  dispatch: Dispatch<Action>;
}

// createContext needs a default — we use null and guard in useStore
const StoreContext = createContext<StoreContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────────
export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

// ── useStore hook ─────────────────────────────────────────────────────────────
// Any component calls useStore() to read state or get dispatch
export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used inside <StoreProvider>');
  }
  return ctx;
}
