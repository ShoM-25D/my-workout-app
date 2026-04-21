const ERROR_MESSAGES: Record<number, string> = {
  404: 'データが見つかりませんでした。',
  500: 'サーバーエラーが発生しました。',
};

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

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      errorData.detail ||
      ERROR_MESSAGES[response.status] ||
      'エラーが発生しました。';
    throw new Error(message);
  }

  return response;
}

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
