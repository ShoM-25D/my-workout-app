'use client';

import { useRouter } from 'next/navigation';
import { RegisterPage } from '@/components/RegisterPage';

export default function RegisterPageConteiner() {
  const router = useRouter();

  const handleRegister = async (
    name: string,
    email: string,
    password: string,
  ) => {
    const response = await fetch('http://localhost:8000/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      alert(errorData.detail || '登録に失敗しました');
      return;
    }

    router.push('/login');
  };
  return <RegisterPage onRegister={handleRegister} />;
}
