export async function fetchWithAuth(url: string, options?: RequestInit) {
  const token = localStorage.getItem('access_token');
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });

  if (response.status === 401) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    window.location.href = '/login';
    throw new Error('セッションが切れました。再度ログインしてください。');
  }

  return response;
}
