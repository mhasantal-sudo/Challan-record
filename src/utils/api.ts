const TOKEN_KEY = 'challan_auth_token';

export function getAuthToken(): string {
  try {
    return localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function setAuthToken(token: string): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Ignore storage restriction errors
  }
}

export function clearAuthToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Ignore
  }
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();
  const headers = new Headers(init.headers || {});
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const url = input.startsWith('/') && API_BASE ? `${API_BASE}${input}` : input;
  const res = await fetch(url, {
    ...init,
    headers,
    credentials: API_BASE ? 'omit' : 'include',
  });
  if (res.status === 401 && !input.includes('/api/auth/')) {
    clearAuthToken();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('challan-auth-expired'));
    }
  }
  return res;
}
