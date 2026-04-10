'use client';

import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();
  return (
    <div>
      <h1 className="p-8 text-center">ページが見つかりません</h1>
      <button
        onClick={() => {
          const token = localStorage.getItem('access_token');
          router.push(token ? '/dashboard' : '/login');
        }}
      >
        戻る
      </button>
    </div>
  );
}
