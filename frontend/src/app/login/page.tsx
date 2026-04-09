'use client';

import { useRouter } from 'next/navigation';
import { LoginPage } from '@/components/LoginPage';
import { API_BASE_URL } from '@/lib/api';
import { toast } from 'sonner';

export default function LoginPageContainer() {
  const router = useRouter();

  // ユーザのログイン情報、画面の状態を管理 - handle系
  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || '登録に失敗しました');
      }
      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user_name', data.name);
      localStorage.setItem('user_email', data.email);

      router.push('/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : '不明なエラー';
      toast.error(message);
    }
  };

  return <LoginPage onLogin={handleLogin} />;
}
