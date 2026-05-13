import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { StoreProvider } from './store/StoreContext';
import { AuthProvider } from './features/auth/context/AuthContext';
import { ThemeProvider } from './store/ThemeContext';
import App from './App';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <StoreProvider>
            <ThemeProvider>
              <App />
              <Toaster
                position="bottom-right"
                toastOptions={{
                  duration: 2500,
                  style: {
                    background: '#1e293b',
                    color: '#f1f5f9',
                    borderRadius: '8px',
                    fontSize: '14px',
                  },
                }}
              />
            </ThemeProvider>
          </StoreProvider>
        </AuthProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
);
