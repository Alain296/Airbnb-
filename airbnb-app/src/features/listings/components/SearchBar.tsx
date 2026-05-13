import { useEffect, useRef } from 'react';
import { FiSearch } from 'react-icons/fi';
import { useStore } from '../../../store/StoreContext';

export function SearchBar() {
  const { state, dispatch } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => () => { if (timerRef.current) window.clearTimeout(timerRef.current); }, []);

  return (
    <div style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        type="text"
        placeholder="What are you looking for?"
        defaultValue={state.filter}
        onChange={e => {
          if (timerRef.current) window.clearTimeout(timerRef.current);
          const value = e.target.value;
          timerRef.current = window.setTimeout(() => {
            dispatch({ type: 'SET_FILTER', payload: value });
          }, 300);
        }}
        style={{
          width: '100%', padding: '11px 14px 11px 38px',
          border: '1px solid #e2e8f0', borderRadius: 8,
          fontSize: 14, outline: 'none', boxSizing: 'border-box',
          transition: 'border-color 0.2s',
        }}
        onFocus={e => (e.target.style.borderColor = '#ff5722')}
        onBlur={e  => (e.target.style.borderColor = '#e2e8f0')}
      />
      <span style={{
        position: 'absolute', left: 11, top: '50%',
        transform: 'translateY(-50%)', color: '#888', pointerEvents: 'none',
        display: 'flex', alignItems: 'center',
      }}>
        <FiSearch size={15} />
      </span>
    </div>
  );
}
