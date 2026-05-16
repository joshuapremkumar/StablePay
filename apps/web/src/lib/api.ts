const env = import.meta.env as unknown as Record<string, string | undefined>;

export const API_BASE_URL =
  env.NEXT_PUBLIC_API_URL || env.VITE_API_URL || "http://localhost:8000/api/v1";

type ApiOptions = RequestInit & {
  token?: string | null;
};

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const token =
    options.token ??
    (typeof window !== "undefined" ? window.localStorage.getItem("access_token") : null);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      message = body.detail || body.message || message;
    } catch {
      // Keep the status-based fallback when the API returns a non-JSON error.
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export type AuthResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    organization_id?: string | null;
  };
};

export const authApi = {
  login: (data: { email: string; password: string }) =>
    apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  register: (data: { email: string; password: string; first_name: string; last_name: string }) =>
    apiRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
