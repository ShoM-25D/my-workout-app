'use client';

import { useRouter } from 'next/navigation';
import { LoginPage } from '@/components/LoginPage';

export default function LoginPageContainer() {
  const router = useRouter();

  const handleLogin = (email: string) => {
    // ログイン処理後、URLを移動させる (ステート切り替えではない)
    router.push('/dashboard');
  };

  return <LoginPage onLogin={handleLogin} />;
}
