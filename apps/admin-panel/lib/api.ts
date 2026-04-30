import Cookies from 'js-cookie';

const API_BASE_URL = '/api';

class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request(endpoint: string, options: RequestInit = {}) {
  let token = Cookies.get('token');
  
  if (!token && typeof window !== 'undefined') {
    token = localStorage.getItem('token') || undefined;
  }
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Add impersonation header if present in localStorage
  if (typeof window !== 'undefined') {
    const isImpersonating = localStorage.getItem('isImpersonating') === 'true';
    const impersonatedId = localStorage.getItem('tenant_id');
    if (isImpersonating && impersonatedId) {
       headers.set('x-impersonate-tenant-id', impersonatedId);
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }
    
    // Auto-logout on 401 Unauthorized — use the server-side route
    // to ensure cookies are properly cleared
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('refreshToken');
      // POST to server-side logout then redirect — best effort
      fetch('/api/logout', { method: 'POST', credentials: 'include' })
        .finally(() => { window.location.href = '/login'; });
    }

    throw new ApiError(response.status, errorData.message || 'API Request Failed', errorData);
  }

  // Handle 204 No Content or empty bodies
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error('Failed to parse JSON response:', text);
    return text; // Return as text if not valid JSON
  }
}

export const api = {
  get: (endpoint: string) => request(endpoint, { method: 'GET' }),
  post: (endpoint: string, data: any) => request(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint: string, data: any) => request(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  patch: (endpoint: string, data: any) => request(endpoint, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (endpoint: string) => request(endpoint, { method: 'DELETE' }),
};
