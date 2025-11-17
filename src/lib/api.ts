// Simple fetch wrapper with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Include cookies for HTTP-only JWT tokens
    ...options,
  };

  // Add auth token if available (fallback for non-HTTP-only tokens)
  const token = localStorage.getItem('auth_token');
  if (token) {
    const headers = new Headers(config.headers);
    if (!headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
      config.headers = headers;
    }
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    if (response.status === 401) {
      // Clear any stored tokens
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    const error = await response.json().catch(() => ({ message: `API Error: ${response.status}` }));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

// API utilities
export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint),
  post: <T>(endpoint: string, data: unknown) => 
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  put: <T>(endpoint: string, data: unknown) => 
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  patch: <T>(endpoint: string, data: unknown) => 
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (endpoint: string) => 
    apiRequest(endpoint, { method: 'DELETE' }),
};
