'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { RegisterPage } from '@/components/RegisterPage';
import { API_BASE_URL } from '@/lib/api';

export default function RegisterPageConteiner() {
  const router = useRouter();
  const handleRegister = async (
    name: string,
    email: string,
    password: string,
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || '登録に失敗しました。');
      }

      router.push('/login');
    } catch (error) {
      const message = error instanceof Error ? error.message : '不明なエラー';
      toast.error(message);
    }
  };
  return <RegisterPage onRegister={handleRegister} />;
}
