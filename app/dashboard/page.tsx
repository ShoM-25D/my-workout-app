'use client';

import { useRouter } from 'next/navigation';
import { useWorkouts } from '@/hooks/useWorkouts';
import { Dashboard } from '@/components/Dashboard';
import { mockWorkouts } from '@/data/mockWorkouts';

export default function DashboardPage() {
  const { workouts, loading } = useWorkouts();
  const router = useRouter();

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
