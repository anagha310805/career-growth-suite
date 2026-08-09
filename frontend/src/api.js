
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export async function apiRequest(path, options = {}) {
  const { body, headers, ...rest } = options;

  const fetchOptions = {
    credentials: 'include',
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body !== undefined) {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    fetchOptions
  );

  return response;
}

