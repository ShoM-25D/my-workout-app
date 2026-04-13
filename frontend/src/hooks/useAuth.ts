import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

export function useAuth(requireAdmin: boolean) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }
    if (requireAdmin) {
      const is_admin = localStorage.getItem('is_admin') === 'true';
      if (!is_admin) {
        toast.error('アクセス権限がありません');
        router.push('/dashboard');
        return;
      }
    }
    setIsLoading(false);
  }, []);
  return { isLoading };
}
