const DEFAULT_API_URL = import.meta.env.PROD
  ? '/api/v1'
  : 'http://localhost:3000/api/v1';

const rawApiUrl = import.meta.env.PROD
  ? DEFAULT_API_URL
  : import.meta.env.VITE_API_URL ?? DEFAULT_API_URL;

const stripApiVersion = (url: string) =>
  url
    .trim()
    .replace(/\/+$/, '')
    .replace(/(?:\/api\/v1)+$/i, '');

const normalizeApiPath = (path: string) =>
  `/${path.replace(/^\/+/, '').replace(/^(?:api\/v1\/)+/i, '')}`;

export const API_ORIGIN = stripApiVersion(rawApiUrl);
export const API_BASE_URL = `${API_ORIGIN}/api/v1`;

export const apiUrl = (path: string) => `${API_BASE_URL}${normalizeApiPath(path)}`;

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers = new Headers(options.headers);
  const isFormData = options.body instanceof FormData;
  if (!isFormData && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let res: Response;
  try {
    res = await fetch(apiUrl(path), {
      ...options,
      headers,
    });
  } catch {
    throw new Error(`Cannot reach the API at ${API_BASE_URL}`);
  }

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('airbnb-auth');
    localStorage.removeItem('airbnb-user-email');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({} as { message?: string; error?: string }));
    throw new Error(body.message ?? body.error ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  upload: <T>(path: string, formData: FormData) =>
    request<T>(path, { method: 'POST', body: formData }),
  delete: <T>(path: string) =>
    request<T>(path, { method: 'DELETE' }),
};

