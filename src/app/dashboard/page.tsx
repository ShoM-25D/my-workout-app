'use client';

import { useRouter } from 'next/navigation';
import { Dashboard } from '@/components/Dashboard';
import { mockWorkouts } from '@/mocks/mockWorkouts';

export default function DashboardPage() {
  const router = useRouter();

  const loading = false; // データの取得状況を管理する状態（例: useStateで管理）

  const currentUser = {
    id: '1',
    name: 'トレーニー',
    email: 'test@example.com', // 既存の情報をここに注入
  };

  // データの取得状況をチェック（JavaのNullチェックに近い感覚）
  if (loading) return <div>Loading...</div>;

  return (
    <Dashboard
      user={currentUser}
      workouts={mockWorkouts}
      onViewWorkout={(workout) => router.push(`/workouts/${workout.id}`)}
      onLogout={() => router.push('/login')}
    />
  );
}
