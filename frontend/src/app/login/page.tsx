'use client';

import { useRouter } from 'next/navigation';
import { LoginPage } from '@/components/LoginPage';

export default function LoginPageContainer() {
  const router = useRouter();

  // ユーザのログイン情報、画面の状態を管理 - handle系
  const handleLogin = async (email: string, password: string) => {
    const response = await fetch('http://localhost:8000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // 直列化（シリアライズ）
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      alert('ログイン失敗');
      return;
    }
    const data = await response.json();

    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('user_name', data.name);
    localStorage.setItem('user_email', data.email);

    router.push('/dashboard');
  };

  return <LoginPage onLogin={handleLogin} />;
}
